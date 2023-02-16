type TestFn = (name: string) => boolean;

export type ContentTypeDef = {
  test: RegExp | TestFn,
  type: string,
  binary?: boolean,
};

export type ContentTypeMatch = {
  type: string,
  binary: boolean,
};

export type DefaultContentTypesModule = {
  mergeContentTypes: (contentTypes: ContentTypeDef[]) => ContentTypeDef[],
  testFileContentType: (contentTypes: ContentTypeDef[], file: string) => ContentTypeMatch,
};

export type AssetBase = {
  contentType: string,
  module: any | null,
  loadModule: (() => Promise<any>) | null,
  isStatic: boolean,
};
export type StringAsset = AssetBase & {
  type: 'string',
  content: string,
};
export type BinaryAsset = AssetBase & {
  type: 'binary',
  content: Uint8Array,
};
export type Asset = StringAsset | BinaryAsset;

export type AssetsMap = {
  [filePath: string]: Asset,
};

export type ModuleLoadType = 'static' | 'dynamic';
export type ModuleTestResult = ModuleLoadType | false;
export type ModuleTestFunction = ((path: string) => true | ModuleTestResult) | null;

export type Config = {
  publicDir: string,
  excludeDirs?: string[] | null,
  includeDirs?: string[] | null,
  staticDirs?: string [] | null,
  excludeTest?: ((path: string) => boolean) | null,
  moduleTest?: ModuleTestFunction,
  spa?: string | null,
  autoIndex?: string[] | false | null,
  autoExt?: string[] | false | null,
  notFoundPage?: string | false | null,
  contentTypes?: ContentTypeDef[] | null,
};
