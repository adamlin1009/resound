// Email service using Resend (add RESEND_API_KEY to your .env)
// Run: npm install resend
// For now, this is a simple setup - install Resend when ready

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailData) {
  // Check if Resend is available
  if (!process.env.RESEND_API_KEY) {
    console.log(`Email would be sent to ${to}: ${subject}`);
    console.log('HTML content:', html);
    return { success: true, message: 'Email logged (no service configured)' };
  }

  try {
    // When you install Resend, uncomment this:
    /*
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: 'Resound <noreply@yourdomain.com>', // Replace with your domain
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Email sending error:', error);
      return { success: false, error };
    }

    return { success: true, data };
    */

    // For now, just log the email
    console.log(`📧 Email to ${to}: ${subject}`);
    return { success: true, message: 'Email logged' };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

// Email templates
export const emailTemplates = {
  bookingConfirmation: (data: {
    userName: string;
    listingTitle: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    ownerName: string;
  }) => `
    <h2>Booking Confirmed! 🎵</h2>
    <p>Hi ${data.userName},</p>
    <p>Your rental booking has been confirmed:</p>
    <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3>${data.listingTitle}</h3>
      <p><strong>Dates:</strong> ${data.startDate} to ${data.endDate}</p>
      <p><strong>Total:</strong> $${(data.totalPrice / 100).toFixed(2)}</p>
      <p><strong>Owner:</strong> ${data.ownerName}</p>
    </div>
    <p>You can now message the owner through your Resound account to coordinate pickup details.</p>
    <p>Thanks for using Resound!</p>
  `,

  paymentConfirmation: (data: {
    userName: string;
    amount: number;
    listingTitle: string;
  }) => `
    <h2>Payment Confirmed! 💳</h2>
    <p>Hi ${data.userName},</p>
    <p>Your payment of $${(data.amount / 100).toFixed(2)} for "${data.listingTitle}" has been processed successfully.</p>
    <p>Your booking is now confirmed and you can coordinate with the instrument owner.</p>
    <p>Thanks for using Resound!</p>
  `,

  newBooking: (data: {
    ownerName: string;
    renterName: string;
    listingTitle: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
  }) => `
    <h2>New Booking Received! 🎉</h2>
    <p>Hi ${data.ownerName},</p>
    <p>You have a new rental booking:</p>
    <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3>${data.listingTitle}</h3>
      <p><strong>Renter:</strong> ${data.renterName}</p>
      <p><strong>Dates:</strong> ${data.startDate} to ${data.endDate}</p>
      <p><strong>Total:</strong> $${(data.totalPrice / 100).toFixed(2)}</p>
    </div>
    <p>You can message the renter through your Resound account to coordinate pickup details.</p>
    <p>Thanks for sharing your instrument!</p>
  `,

  cancellationNotice: (data: {
    userName: string;
    listingTitle: string;
    refundAmount?: number;
    canceledBy: string;
  }) => `
    <h2>Booking Cancellation Notice</h2>
    <p>Hi ${data.userName},</p>
    <p>Your booking for "${data.listingTitle}" has been canceled by ${data.canceledBy}.</p>
    ${data.refundAmount ? `
      <p><strong>Refund:</strong> $${(data.refundAmount / 100).toFixed(2)} will be processed back to your original payment method within 3-5 business days.</p>
    ` : `
      <p>No refund is available per our cancellation policy.</p>
    `}
    <p>Thanks for understanding.</p>
  `
};