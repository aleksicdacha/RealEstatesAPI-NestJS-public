import { NewsletterSubscriberService } from './newsletter-subscriber.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockRepo = () => ({
  findByEmail: jest.fn(),
  findByUnsubscribeToken: jest.fn(),
  findWithFilters: jest.fn(),
  findActiveSubscribers: jest.fn(),
  findActiveSubscribersByEmails: jest.fn(),
  save: jest.fn(),
});

const mockEmailService = () => ({
  sendNewsletterEmail: jest.fn(),
});

const mockSubscriber = (overrides = {}) => ({
  id: 'sub-uuid-1',
  email: 'test@test.com',
  isActive: true,
  unsubscribeToken: 'token-123',
  subscribedAt: new Date(),
  updatedAt: new Date(),
  unsubscribedAt: null,
  ...overrides,
});

describe('NewsletterSubscriberService', () => {
  let service: NewsletterSubscriberService;
  let repo: ReturnType<typeof mockRepo>;
  let emailService: ReturnType<typeof mockEmailService>;

  beforeEach(() => {
    repo = mockRepo();
    emailService = mockEmailService();
    service = new NewsletterSubscriberService(repo as any, emailService as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('subscribe', () => {
    it('creates new subscriber', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.save.mockResolvedValue(mockSubscriber());

      const result = await service.subscribe({ email: 'new@test.com' });
      expect(result.message).toContain('pretplatili');
      expect(repo.save).toHaveBeenCalled();
    });

    it('reactivates inactive subscriber', async () => {
      const inactive = mockSubscriber({
        isActive: false,
        unsubscribedAt: new Date(),
      });
      repo.findByEmail.mockResolvedValue(inactive);
      repo.save.mockResolvedValue({ ...inactive, isActive: true });

      const result = await service.subscribe({ email: 'test@test.com' });
      expect(result.message).toContain('ponovo pretplatili');
      expect(inactive.isActive).toBe(true);
      expect(inactive.unsubscribedAt).toBeNull();
    });

    it('throws ConflictException for already active subscriber', async () => {
      repo.findByEmail.mockResolvedValue(mockSubscriber({ isActive: true }));
      await expect(
        service.subscribe({ email: 'test@test.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('unsubscribe', () => {
    it('deactivates subscriber by token', async () => {
      const sub = mockSubscriber();
      repo.findByUnsubscribeToken.mockResolvedValue(sub);
      repo.save.mockResolvedValue({ ...sub, isActive: false });

      const result = await service.unsubscribe({ token: 'token-123' });
      expect(result.message).toContain('odjavili');
      expect(sub.isActive).toBe(false);
      expect(sub.unsubscribedAt).toBeInstanceOf(Date);
    });

    it('throws NotFoundException for invalid token', async () => {
      repo.findByUnsubscribeToken.mockResolvedValue(null);
      await expect(service.unsubscribe({ token: 'bad-token' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns message for already unsubscribed', async () => {
      repo.findByUnsubscribeToken.mockResolvedValue(
        mockSubscriber({ isActive: false }),
      );
      const result = await service.unsubscribe({ token: 'token-123' });
      expect(result.message).toContain('Već ste odjavljeni');
    });
  });

  describe('sendNewsletter', () => {
    it('sends to all active subscribers when no recipients', async () => {
      const subs = [
        mockSubscriber(),
        mockSubscriber({ id: 'sub-2', email: 'b@test.com' }),
      ];
      repo.findActiveSubscribers.mockResolvedValue(subs);
      emailService.sendNewsletterEmail.mockResolvedValue(undefined);

      const result = await service.sendNewsletter({
        subject: 'Test',
        content: '<p>Hi</p>',
      } as any);
      expect(result.sentCount).toBe(2);
      expect(emailService.sendNewsletterEmail).toHaveBeenCalledTimes(2);
    });

    it('sends to specific recipients', async () => {
      const sub = mockSubscriber();
      repo.findActiveSubscribersByEmails.mockResolvedValue([sub]);
      emailService.sendNewsletterEmail.mockResolvedValue(undefined);

      const result = await service.sendNewsletter({
        subject: 'Test',
        content: '<p>Hi</p>',
        recipients: ['test@test.com'],
      });
      expect(result.sentCount).toBe(1);
      expect(repo.findActiveSubscribersByEmails).toHaveBeenCalled();
    });

    it('deduplicates recipients', async () => {
      repo.findActiveSubscribersByEmails.mockResolvedValue([mockSubscriber()]);
      emailService.sendNewsletterEmail.mockResolvedValue(undefined);

      await service.sendNewsletter({
        subject: 'Test',
        content: 'Hi',
        recipients: ['Test@test.com', 'test@test.com', ' Test@test.com '],
      });

      // Should deduplicate to unique emails
      const call = repo.findActiveSubscribersByEmails.mock.calls[0][0];
      const unique = new Set(call.map((e: string) => e.toLowerCase()));
      expect(unique.size).toBe(1);
    });

    it('returns zero when no active subscribers', async () => {
      repo.findActiveSubscribers.mockResolvedValue([]);
      const result = await service.sendNewsletter({
        subject: 'Test',
        content: 'Hi',
      } as any);
      expect(result.sentCount).toBe(0);
      expect(emailService.sendNewsletterEmail).not.toHaveBeenCalled();
    });

    it('continues sending when individual email fails', async () => {
      const subs = [
        mockSubscriber({ email: 'a@test.com' }),
        mockSubscriber({ id: 'sub-2', email: 'b@test.com' }),
      ];
      repo.findActiveSubscribers.mockResolvedValue(subs);
      emailService.sendNewsletterEmail
        .mockRejectedValueOnce(new Error('SMTP fail'))
        .mockResolvedValueOnce(undefined);

      const result = await service.sendNewsletter({
        subject: 'Test',
        content: 'Hi',
      } as any);
      expect(result.sentCount).toBe(1);
      expect(emailService.sendNewsletterEmail).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAllSubscribers', () => {
    it('delegates to repository with filters', async () => {
      const filters = { isActive: true };
      repo.findWithFilters.mockResolvedValue([mockSubscriber()]);
      const result = await service.getAllSubscribers(filters as any);
      expect(repo.findWithFilters).toHaveBeenCalledWith(filters);
      expect(result).toHaveLength(1);
    });
  });

  describe('getActiveSubscribers', () => {
    it('delegates to repository', async () => {
      repo.findActiveSubscribers.mockResolvedValue([mockSubscriber()]);
      const result = await service.getActiveSubscribers();
      expect(result).toHaveLength(1);
    });
  });
});
