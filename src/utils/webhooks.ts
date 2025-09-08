/**
 * Webhook utility for notifying about expired items
 */

interface NotifyExpiryData {
  itemName: string;
  expiryDate: string;
  userEmail: string;
}

/**
 * Sends notification to n8n webhook when an item expires
 * @param data - The item data to send
 * @returns Promise<boolean> - Success status of the request
 */
export const notifyExpiry = async (data: NotifyExpiryData): Promise<boolean> => {
  const webhookUrl = "https://manohar12345.app.n8n.cloud/webhook/9cafaedb-017a-4546-a80c-168863617480";
  
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors", // Add this to handle CORS
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemName: data.itemName,
        expiryDate: data.expiryDate,
        userEmail: data.userEmail,
        timestamp: new Date().toISOString(),
        source: "Smart Fridge App"
      }),
    });

    // Since we're using no-cors, we can't access response.ok
    // Just assume success and log the attempt
    console.log(`Expiry notification sent for ${data.itemName} to n8n webhook`);
    return true;
  } catch (error) {
    console.error("Error sending expiry notification:", error);
    return false;
  }
};