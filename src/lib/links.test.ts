import { describe, expect, it } from 'vitest';
import { parseTelegramUsername, safeHttpsUrl, telegramLink } from './links';

const BASE_COURSE_MESSAGE = 'Здравствуйте! Меня интересует базовое обучение с нуля «База 3.0»';

describe('safeHttpsUrl', () => {
  it('принимает https', () => {
    expect(safeHttpsUrl('https://wa.me/79990000000')).toBe('https://wa.me/79990000000');
  });
  it('отклоняет пустое, http, javascript:, мусор', () => {
    expect(safeHttpsUrl('')).toBeNull();
    expect(safeHttpsUrl('   ')).toBeNull();
    expect(safeHttpsUrl('http://example.com')).toBeNull();
    expect(safeHttpsUrl('javascript:alert(1)')).toBeNull();
    expect(safeHttpsUrl('example.com')).toBeNull();
    expect(safeHttpsUrl('data:text/html,<b>x</b>')).toBeNull();
  });
});

describe('parseTelegramUsername', () => {
  it.each([
    ['nastya_hair', 'nastya_hair'],
    ['@nastya_hair', 'nastya_hair'],
    ['t.me/nastya_hair', 'nastya_hair'],
    ['https://t.me/nastya_hair', 'nastya_hair'],
    ['https://t.me/nastya_hair?text=hi', 'nastya_hair'],
    ['https://telegram.me/nastya_hair/', 'nastya_hair'],
  ])('%s → %s', (input, expected) => {
    expect(parseTelegramUsername(input)).toBe(expected);
  });
  it('отклоняет некорректные значения', () => {
    expect(parseTelegramUsername('')).toBeNull();
    expect(parseTelegramUsername('ab')).toBeNull();
    expect(parseTelegramUsername('1abcde')).toBeNull();
    expect(parseTelegramUsername('bad name')).toBeNull();
    expect(parseTelegramUsername('https://evil.com/nastya_hair')).toBeNull();
  });
});

describe('telegramLink', () => {
  it('собирает deep link с закодированным текстом «Базы 3.0»', () => {
    const link = telegramLink('nastya_hair', BASE_COURSE_MESSAGE)!;
    expect(link.startsWith('https://t.me/nastya_hair?text=')).toBe(true);
    const text = new URL(link).searchParams.get('text');
    expect(text).toBe('Здравствуйте! Меня интересует базовое обучение с нуля «База 3.0»');
  });
  it('без текста — просто чат', () => {
    expect(telegramLink('@nastya_hair')).toBe('https://t.me/nastya_hair');
  });
  it('null при пустом username', () => {
    expect(telegramLink('', 'x')).toBeNull();
  });
});
