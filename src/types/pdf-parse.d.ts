declare module 'pdf-parse' {
  interface PdfParseOptions {
    max?: number;
    version?: string;
  }

  interface PdfParseResult {
    numpages?: number;
    numrender?: number;
    info?: any;
    metadata?: any;
    text?: string;
  }

  function pdf(data: Buffer | Uint8Array | string, options?: PdfParseOptions): Promise<PdfParseResult>;

  export = pdf;
}
