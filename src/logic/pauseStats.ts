/**
 * Harmonia Vision - Pause Statistics
 * Tracks eye break statistics locally for privacy.
 */

import * as vscode from 'vscode';

export interface DailyStats {
    date: string; // YYYY-MM-DD
    breaksTaken: number;
    breaksSnoozed: number;
    breaksDismissed: number;
    totalRestSeconds: number;
}

export interface PauseStatsSummary {
    today: DailyStats;
    week: {
        breaksTaken: number;
        breaksSnoozed: number;
        breaksDismissed: number;
        totalRestSeconds: number;
        complianceRate: number;
    };
    allTime: {
        breaksTaken: number;
        totalRestSeconds: number;
        currentStreak: number;
        longestStreak: number;
        firstActiveDate: string | null;
    };
}

interface StoredStats {
    dailyStats: DailyStats[];
    longestStreak: number;
}

const STATS_KEY = 'harmoniaVision.pauseStats';
const MAX_DAYS_STORED = 90;

export class PauseStats {
    private _globalState: vscode.Memento;
    private _stats: StoredStats;

    constructor(globalState: vscode.Memento) {
        this._globalState = globalState;
        this._stats = this._load();
    }

    private _load(): StoredStats {
        const stored = this._globalState.get<StoredStats>(STATS_KEY);
        return stored || { dailyStats: [], longestStreak: 0 };
    }

    private async _save(): Promise<void> {
        // Keep only last 90 days
        if (this._stats.dailyStats.length > MAX_DAYS_STORED) {
            this._stats.dailyStats = this._stats.dailyStats.slice(-MAX_DAYS_STORED);
        }
        await this._globalState.update(STATS_KEY, this._stats);
    }

    private _getTodayKey(): string {
        return new Date().toISOString().split('T')[0];
    }

    private _getOrCreateToday(): DailyStats {
        const todayKey = this._getTodayKey();
        let today = this._stats.dailyStats.find(d => d.date === todayKey);
        if (!today) {
            today = {
                date: todayKey,
                breaksTaken: 0,
                breaksSnoozed: 0,
                breaksDismissed: 0,
                totalRestSeconds: 0,
            };
            this._stats.dailyStats.push(today);
        }
        return today;
    }

    public async recordBreakTaken(durationSeconds: number): Promise<void> {
        const today = this._getOrCreateToday();
        today.breaksTaken++;
        today.totalRestSeconds += durationSeconds;
        this._updateStreak();
        await this._save();
    }

    public async recordBreakSnoozed(): Promise<void> {
        const today = this._getOrCreateToday();
        today.breaksSnoozed++;
        await this._save();
    }

    public async recordBreakDismissed(): Promise<void> {
        const today = this._getOrCreateToday();
        today.breaksDismissed++;
        await this._save();
    }

    private _updateStreak(): void {
        const streak = this._calculateCurrentStreak();
        if (streak > this._stats.longestStreak) {
            this._stats.longestStreak = streak;
        }
    }

    private _calculateCurrentStreak(): number {
        const sorted = [...this._stats.dailyStats]
            .filter(d => d.breaksTaken > 0)
            .sort((a, b) => b.date.localeCompare(a.date));

        if (sorted.length === 0) return 0;

        const today = this._getTodayKey();
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Must have activity today or yesterday to have active streak
        if (sorted[0].date !== today && sorted[0].date !== yesterday) return 0;

        let streak = 1;
        for (let i = 1; i < sorted.length; i++) {
            const prevDate = new Date(sorted[i - 1].date);
            const currDate = new Date(sorted[i].date);
            const diffDays = (prevDate.getTime() - currDate.getTime()) / 86400000;
            if (diffDays === 1) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    public getSummary(): PauseStatsSummary {
        const todayKey = this._getTodayKey();
        const today = this._stats.dailyStats.find(d => d.date === todayKey) || {
            date: todayKey,
            breaksTaken: 0,
            breaksSnoozed: 0,
            breaksDismissed: 0,
            totalRestSeconds: 0,
        };

        // Last 7 days
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        const weekStats = this._stats.dailyStats.filter(d => d.date >= weekAgo);
        const weekTaken = weekStats.reduce((sum, d) => sum + d.breaksTaken, 0);
        const weekSnoozed = weekStats.reduce((sum, d) => sum + d.breaksSnoozed, 0);
        const weekDismissed = weekStats.reduce((sum, d) => sum + d.breaksDismissed, 0);
        const weekTotal = weekTaken + weekSnoozed + weekDismissed;

        // All time
        const allTimeTaken = this._stats.dailyStats.reduce((sum, d) => sum + d.breaksTaken, 0);
        const allTimeRest = this._stats.dailyStats.reduce((sum, d) => sum + d.totalRestSeconds, 0);
        const firstDate = this._stats.dailyStats.length > 0
            ? this._stats.dailyStats.sort((a, b) => a.date.localeCompare(b.date))[0].date
            : null;

        return {
            today,
            week: {
                breaksTaken: weekTaken,
                breaksSnoozed: weekSnoozed,
                breaksDismissed: weekDismissed,
                totalRestSeconds: weekStats.reduce((sum, d) => sum + d.totalRestSeconds, 0),
                complianceRate: weekTotal > 0 ? Math.round((weekTaken / weekTotal) * 100) : 0,
            },
            allTime: {
                breaksTaken: allTimeTaken,
                totalRestSeconds: allTimeRest,
                currentStreak: this._calculateCurrentStreak(),
                longestStreak: this._stats.longestStreak,
                firstActiveDate: firstDate,
            },
        };
    }

    public async reset(): Promise<void> {
        this._stats = { dailyStats: [], longestStreak: 0 };
        await this._save();
    }
}
