import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import { SoundManager } from '../systems/SoundManager';

export class CreditsScene extends Phaser.Scene {
  constructor() { super({ key: 'CreditsScene' }); }

  create() {
    const cx = GAME_WIDTH / 2;

    // Background — dark walnut hardwood planks
    const PLANK_H = 34;
    const plankCols = [0x2E1E0F, 0x251508, 0x2B1B0D, 0x221307, 0x301F10];
    const floorGfx = this.add.graphics();
    const rowCount = Math.ceil(GAME_HEIGHT / PLANK_H) + 1;
    for (let row = 0; row < rowCount; row++) {
      floorGfx.fillStyle(plankCols[row % plankCols.length], 1);
      floorGfx.fillRect(0, row * PLANK_H, GAME_WIDTH, PLANK_H);
    }
    floorGfx.fillStyle(0x000000, 0.25);
    for (let row = 1; row < rowCount; row++) {
      floorGfx.fillRect(0, row * PLANK_H - 1, GAME_WIDTH, 1);
    }
    floorGfx.fillStyle(0xFF9944, 0.04);
    for (let row = 0; row < rowCount; row++) {
      floorGfx.fillRect(0, row * PLANK_H, GAME_WIDTH, 2);
    }

    // Top accent stripe
    this.add.rectangle(cx, 2, GAME_WIDTH, 4, COLORS.UI_ORANGE).setOrigin(0.5, 0);

    // Side walls — terracotta upper / cream wainscoting lower
    const wallW = 16;
    const wallH = GAME_HEIGHT - 90;
    const lW = this.add.graphics();
    lW.fillStyle(0xBF7A42, 1);
    lW.fillRect(0, 90, wallW, Math.floor(wallH * 0.58));
    lW.fillStyle(0xEEE3D2, 1);
    lW.fillRect(0, 90 + Math.floor(wallH * 0.58), wallW, Math.floor(wallH * 0.4));
    lW.fillStyle(0x5A2E12, 1);
    lW.fillRect(0, 90 + Math.floor(wallH * 0.57), wallW, 4);
    lW.fillStyle(0x251007, 1);
    lW.fillRect(0, GAME_HEIGHT - 14, wallW, 14);
    const rW = this.add.graphics();
    rW.fillStyle(0xBF7A42, 1);
    rW.fillRect(GAME_WIDTH - wallW, 90, wallW, Math.floor(wallH * 0.58));
    rW.fillStyle(0xEEE3D2, 1);
    rW.fillRect(GAME_WIDTH - wallW, 90 + Math.floor(wallH * 0.58), wallW, Math.floor(wallH * 0.4));
    rW.fillStyle(0x5A2E12, 1);
    rW.fillRect(GAME_WIDTH - wallW, 90 + Math.floor(wallH * 0.57), wallW, 4);
    rW.fillStyle(0x251007, 1);
    rW.fillRect(GAME_WIDTH - wallW, GAME_HEIGHT - 14, wallW, 14);

    // Top wall bar
    this.add.rectangle(cx, 45, GAME_WIDTH, 90, COLORS.WALL_ACCENT);

    // Header
    this.add.text(cx, 56, 'CREDITS', {
      fontSize: '34px', fontFamily: 'Arial Black', color: COLORS.TEXT_LIGHT, fontStyle: 'bold',
    }).setOrigin(0.5);

    // Card panel
    const panelG = this.add.graphics();
    panelG.fillStyle(0xFFFCF5, 1);
    panelG.fillRoundedRect(cx - 190, 115, 380, 560, 16);
    panelG.lineStyle(2, 0xDDCCAA, 0.8);
    panelG.strokeRoundedRect(cx - 190, 115, 380, 560, 16);

    const credits = [
      { icon: '✦', label: 'Game Concept & Product Owner', value: 'Mordechai Neeman' },
      { icon: '✦', label: 'Implementation', value: 'Claude Code' },
      { icon: '✦', label: 'Engine', value: 'Phaser 3' },
      { icon: '✦', label: 'Build Tool', value: 'Vite + TypeScript' },
    ];

    let y = 165;
    credits.forEach((c, i) => {
      // Divider (after first entry)
      if (i > 0) {
        const div = this.add.graphics();
        div.lineStyle(1, 0xEEDDBB, 1);
        div.lineBetween(cx - 160, y - 14, cx + 160, y - 14);
      }

      this.add.text(cx, y, `${c.icon}  ${c.label}`, {
        fontSize: '14px', fontFamily: 'Arial', color: '#999999',
      }).setOrigin(0.5);
      this.add.text(cx, y + 28, c.value, {
        fontSize: '22px', fontFamily: 'Arial Black', color: COLORS.TEXT_DARK, fontStyle: 'bold',
      }).setOrigin(0.5);
      y += 100;
    });

    // Thank you message
    const divFinal = this.add.graphics();
    divFinal.lineStyle(1, 0xEEDDBB, 1);
    divFinal.lineBetween(cx - 160, y - 14, cx + 160, y - 14);
    this.add.text(cx, y, 'Made with care, one table at a time.', {
      fontSize: '14px', fontFamily: 'Arial', color: '#AAAAAA',
      wordWrap: { width: 320 }, align: 'center',
    }).setOrigin(0.5);

    // Version + copyright at bottom of card
    this.add.text(cx, 638, 'TableRush v1.0.0', {
      fontSize: '15px', fontFamily: 'Arial Black', color: '#BBAA88',
    }).setOrigin(0.5);
    this.add.text(cx, 660, '© 2026 Mordechai Neeman', {
      fontSize: '13px', fontFamily: 'Arial', color: '#CCBBAA',
    }).setOrigin(0.5);

    this.makeBtn(cx, GAME_HEIGHT - 44, '← BACK', () => this.scene.start('MainMenuScene'));
  }

  private makeBtn(x: number, y: number, label: string, cb: () => void) {
    const g = this.add.graphics();
    g.fillStyle(COLORS.UI_ORANGE);
    g.fillRoundedRect(x - 120, y - 22, 240, 44, 10);
    this.add.text(x, y, label, {
      fontSize: '20px', fontFamily: 'Arial Black', color: '#FFFFFF',
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y, 240, 44).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => { SoundManager.uiClick(); cb(); });
  }
}
