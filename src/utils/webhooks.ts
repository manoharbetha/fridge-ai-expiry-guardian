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

    if (response.ok) {
      console.log(`Expiry notification sent successfully for ${data.itemName}`);
      return true;
    } else {
      console.error(`Failed to send expiry notification: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error("Error sending expiry notification:", error);
    return false;
  }
};

/**
 * Checks for expired items and sends notifications
 * @param items - Array of fridge items to check
 * @param userEmail - User's email for notifications
 */
export const checkAndNotifyExpiredItems = async (items: any[], userEmail: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const item of items) {
    const expiryDate = new Date(item.predictedExpiry || item.printedExpiry);
    expiryDate.setHours(0, 0, 0, 0);

    // Check if item is expired and notification hasn't been sent
    if (expiryDate <= today && !item.notificationSent) {
      await notifyExpiry({
        itemName: item.name,
        expiryDate: expiryDate.toISOString().split('T')[0],
        userEmail: userEmail
      });
    }
  }
};