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

/**
 * Checks for expired items and sends notifications
 * @param items - Array of fridge items to check
 * @param userEmail - User's email for notifications
 */
export const checkAndNotifyExpiredItems = async (items: any[], userEmail: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  console.log(`Checking ${items.length} items for expiry notifications...`);

  for (const item of items) {
    const printedExpiry = new Date(item.printedExpiry);
    const predictedExpiry = new Date(item.predictedExpiry);
    const expiryDate = new Date(Math.min(printedExpiry.getTime(), predictedExpiry.getTime()));
    expiryDate.setHours(0, 0, 0, 0);

    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`Item: ${item.name}, Days left: ${daysLeft}, Notification sent: ${item.notificationSent}`);

    // Check if item is expired and notification hasn't been sent
    if (daysLeft <= 0 && !item.notificationSent) {
      console.log(`Sending notification for expired item: ${item.name}`);
      const success = await notifyExpiry({
        itemName: item.name,
        expiryDate: expiryDate.toISOString().split('T')[0],
        userEmail: userEmail
      });
      
      if (success) {
        console.log(`Successfully sent notification for ${item.name}`);
      }
    }
  }
};