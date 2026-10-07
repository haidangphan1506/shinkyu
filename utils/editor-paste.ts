import type { ClipboardEvent } from 'react';

/** Clipboard text with CRLF normalized and zero-width / BOM characters removed. */
export function getPastedText(event: { clipboardData: Pick<DataTransfer, 'getData'> }): string {
  return normalizePastedText(event.clipboardData.getData('text/plain'));
}

export function normalizePastedText(text: string): string {
  return text.replace(/\r\n?/g, '\n').replace(/[​-‍﻿]/g, '');
}

/**
 * Keeps only plain text when pasting into a controlled field: cancels the default paste and
 * hands the cleaned string to `insert` (e.g. to splice into the editor value at the caret).
 */
export function handlePlainTextPaste(event: ClipboardEvent, insert: (text: string) => void): void {
  event.preventDefault();
  insert(getPastedText(event));
}
