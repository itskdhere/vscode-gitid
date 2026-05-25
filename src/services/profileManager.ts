import * as vscode from "vscode";
import { GitProfile } from "../models/gitProfile";

export class ProfileManager {
  private static readonly STORAGE_KEY = "gitid.profiles";

  constructor(private readonly context: vscode.ExtensionContext) {}

  public getProfiles(): GitProfile[] {
    const rawProfiles = this.context.globalState.get<GitProfile[]>(
      ProfileManager.STORAGE_KEY
    );
    return rawProfiles || [];
  }

  public async saveProfile(profile: GitProfile): Promise<void> {
    const profiles = this.getProfiles();
    const index = profiles.findIndex((p) => p.id === profile.id);

    if (index > -1) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }

    await this.context.globalState.update(ProfileManager.STORAGE_KEY, profiles);
  }

  public async deleteProfile(id: string): Promise<void> {
    const profiles = this.getProfiles();
    const filtered = profiles.filter((p) => p.id !== id);
    await this.context.globalState.update(ProfileManager.STORAGE_KEY, filtered);
  }

  public async saveProfiles(profiles: GitProfile[]): Promise<void> {
    await this.context.globalState.update(ProfileManager.STORAGE_KEY, profiles);
  }

  public getProfileById(id: string): GitProfile | undefined {
    return this.getProfiles().find((p) => p.id === id);
  }

  public getProfileByEmail(email: string): GitProfile | undefined {
    const emailLower = email.toLowerCase().trim();
    return this.getProfiles().find(
      (p) => p.email.toLowerCase().trim() === emailLower
    );
  }
}
