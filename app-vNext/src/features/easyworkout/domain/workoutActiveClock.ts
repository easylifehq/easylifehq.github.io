/** Active duration retains partial seconds; hidden wall time never contributes. */
export class WorkoutActiveClock {
  private activeMilliseconds: number;
  private sampledAt: number;
  private visible: boolean;

  constructor(elapsedSeconds: number, now: number, visible: boolean) {
    this.activeMilliseconds = elapsedSeconds * 1000;
    this.sampledAt = now;
    this.visible = visible;
  }

  snapshot(now: number) {
    if (this.visible) this.activeMilliseconds += Math.max(0, Math.min(30_000, now - this.sampledAt));
    this.sampledAt = now;
    return Math.floor(this.activeMilliseconds / 1000);
  }

  setVisible(now: number, visible: boolean) {
    const seconds = this.snapshot(now);
    this.visible = visible;
    return seconds;
  }
}
