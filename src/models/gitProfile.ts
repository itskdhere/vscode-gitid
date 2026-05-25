export interface GitProfile {
  id: string;
  alias: string;
  name: string;
  email: string;
  signingKey?: string;
  gpgSign: boolean;
}

export interface GitConfigValues {
  name?: string;
  email?: string;
  signingKey?: string;
  gpgSign?: boolean;
}
