import { prisma } from "@/lib/prisma";

export async function validateCounterpartyKYC(counterpartyId: string): Promise<{
  isValid: boolean;
  message?: string;
}> {
  try {
    const counterparty = await prisma.counterparty.findUnique({
      where: { id: counterpartyId },
      include: {
        entity: {
          include: {
            kyc: true
          }
        }
      }
    });

    if (!counterparty) {
      return {
        isValid: false,
        message: "Counterparty not found"
      };
    }

    if (!counterparty.entity.kyc) {
      return {
        isValid: false,
        message: "KYC record not found for counterparty"
      };
    }

    const kyc = counterparty.entity.kyc;

    if (kyc.verificationStatus !== "VERIFIED") {
      return {
        isValid: false,
        message: `Counterparty KYC status is ${kyc.verificationStatus}`
      };
    }

    if (!kyc.counterpartyVerified) {
      return {
        isValid: false,
        message: "Counterparty verification is pending"
      };
    }

    return {
      isValid: true
    };
  } catch (error) {
    console.error("Error validating counterparty KYC:", error);
    return {
      isValid: false,
      message: "Error validating counterparty KYC"
    };
  }
} 