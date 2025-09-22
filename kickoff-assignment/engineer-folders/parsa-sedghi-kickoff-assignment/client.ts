export interface AdviceSlip {
  slip: {
    id: number;
    advice: string;
  };
}

export async function getRandomAdvice(): Promise<AdviceSlip["slip"]> {
  try {
    const response = await fetch("https://api.adviceslip.com/advice");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AdviceSlip = await response.json();
    return data.slip;
  } catch (error) {
    console.error("Failed to fetch advice:", error);
    throw error;
  }
}
