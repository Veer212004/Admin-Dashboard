interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
declare class EmailService {
    private transporter;
    private enabled;
    constructor();
    private initializeTransporter;
    sendEmail(options: EmailOptions): Promise<void>;
    sendVerificationEmail(email: string, token: string): Promise<void>;
    sendRoleChangeEmail(email: string, newRole: string): Promise<void>;
    sendBroadcastMessage(email: string, title: string, message: string): Promise<void>;
    sendPasswordResetEmail(email: string, token: string): Promise<void>;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=EmailService.d.ts.map