import { MailtrapClient } from 'mailtrap';

export class EmailService {
    private client: MailtrapClient;
    private defaultSender = {
        email: "hello@paybills.ng",
        name: "Paybills"
    };

    constructor() {
        const token = process.env.MAILTRAP_API_TOKEN || '';
        if (!token) {
            console.warn('MAILTRAP_API_TOKEN is not set in environment. EmailService will fail at runtime.');
        }

        // Initialize the Mailtrap client
        this.client = new MailtrapClient({ token });
    }

    /**
     * Send a standard transactional email.
     * @param to The recipient's email address
     * @param subject The email subject line
     * @param text The plain text content of the email
     * @param html Optional HTML body content
     * @param category A label for analytics (e.g., 'Welcome', 'Receipt')
     */
    async sendEmail(to: string, subject: string, text: string, html?: string, category: string = "Transactional"): Promise<boolean> {
        try {
            const response = await this.client.send({
                from: this.defaultSender,
                to: [{ email: to }],
                subject,
                text,
                html,
                category
            });

            console.log('Mailtrap Sending Success:', response);
            return true;
        } catch (error: any) {
            console.error('Mailtrap Sending Error:', error.message || error);
            throw new Error(`Failed to send email via Mailtrap: ${error.message}`);
        }
    }
}
