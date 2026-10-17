/**
 * Medicine timing and frequency localization helpers.
 * Ensures timing and frequency text display strictly in the user's active language
 * without mixed languages or trailing brackets.
 */

export const MEDICINE_TIMING_CODES = {
  AFTER_MEALS: 'AFTER_MEALS',
  BEFORE_MEALS: 'BEFORE_MEALS',
  BEFORE_BREAKFAST: 'BEFORE_BREAKFAST',
  AFTER_LUNCH: 'AFTER_LUNCH',
  EMPTY_STOMACH: 'EMPTY_STOMACH',
  BEDTIME: 'BEDTIME',
  AS_NEEDED: 'AS_NEEDED'
};

export function getMedicineTimingLabel(timing, t) {
  if (!timing) return '';
  const str = String(timing).trim();

  // If already matches code
  if (str === 'AFTER_MEALS') return t('medicinesPage.timingAfter');
  if (str === 'BEFORE_MEALS') return t('medicinesPage.timingBefore');
  if (str === 'BEFORE_BREAKFAST') return t('medicinesPage.timingBeforeBreakfast');
  if (str === 'AFTER_LUNCH') return t('medicinesPage.timingAfterLunch');
  if (str === 'EMPTY_STOMACH') return t('medicinesPage.timingEmpty');
  if (str === 'BEDTIME') return t('medicinesPage.timingBedtime');
  if (str === 'AS_NEEDED') return t('medicinesPage.timingSos');

  // If string contains legacy text with Marathi/Hindi/English or brackets
  const lower = str.toLowerCase();
  if (lower.includes('breakfast') || str.includes('नाश्त्या') || str.includes('नाश्ते')) {
    return t('medicinesPage.timingBeforeBreakfast');
  }
  if (lower.includes('lunch') || str.includes('दुपारी') || str.includes('दोपहर')) {
    return t('medicinesPage.timingAfterLunch');
  }
  if (lower.includes('empty stomach') || str.includes('रिकाम्या पोटी') || str.includes('खाली पेट')) {
    return t('medicinesPage.timingEmpty');
  }
  if (lower.includes('bedtime') || str.includes('झोपताना') || str.includes('सोते समय')) {
    return t('medicinesPage.timingBedtime');
  }
  if (lower.includes('before meal') || str.includes('जेवणापूर्वी') || str.includes('भोजन से पहले')) {
    return t('medicinesPage.timingBefore');
  }
  if (lower.includes('after meal') || str.includes('जेवणानंतर') || str.includes('भोजन के बाद')) {
    return t('medicinesPage.timingAfter');
  }
  if (lower.includes('needed') || lower.includes('sos') || str.includes('गरज') || str.includes('जरूरत')) {
    return t('medicinesPage.timingSos');
  }

  // Fallback: strip any parentheses from legacy values
  return str.replace(/\s*\([^)]*\)/g, '').trim() || str;
}

export function getMedicineFrequencyLabel(frequency, t) {
  if (!frequency) return '';
  const str = String(frequency).trim();

  if (str.includes('1-0-1') || str.toLowerCase().includes('twice')) {
    return t('medicinesPage.freqTwice');
  }
  if (str.includes('1-0-0')) {
    return t('medicinesPage.freqOnce');
  }
  if (str.includes('0-1-0')) {
    return `${t('medicinesPage.freqOnce')} (0-1-0)`;
  }
  if (str.includes('1-1-1') || str.toLowerCase().includes('thrice')) {
    return t('medicinesPage.freqThrice');
  }
  if (str.toLowerCase().includes('sos') || str.toLowerCase().includes('needed')) {
    return t('medicinesPage.freqSos');
  }

  return str.replace(/\s*\([^)]*\)/g, '').trim() || str;
}
