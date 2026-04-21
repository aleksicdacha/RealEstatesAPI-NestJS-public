import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * ThrottlerGuard that can be disabled via THROTTLE_SKIP=true env var.
 * Useful for e2e testing where hitting the rate limit causes false failures.
 */
@Injectable()
export class ConfigurableThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(_context: ExecutionContext): Promise<boolean> {
    return process.env.THROTTLE_SKIP === 'true';
  }
}
