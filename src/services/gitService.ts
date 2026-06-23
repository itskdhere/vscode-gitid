import * as cp from "child_process";
import { GitConfigValues } from "../models/gitProfile";

export class GitService {
  private static exec(
    command: string,
    cwd?: string
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      cp.exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
          reject({ error, stdout, stderr });
        } else {
          resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
        }
      });
    });
  }

  private static escapeArg(val: string): string {
    const escaped = val.replace(/"/g, '\\"');
    return `"${escaped}"`;
  }

  public static async getActiveEmail(
    cwd?: string
  ): Promise<string | undefined> {
    try {
      const result = await this.exec("git config user.email", cwd);
      return result.stdout || undefined;
    } catch {
      try {
        const globalResult = await this.exec("git config --global user.email");
        return globalResult.stdout || undefined;
      } catch {
        return undefined;
      }
    }
  }

  public static async getActiveScope(
    cwd?: string
  ): Promise<"Local" | "Global"> {
    if (!cwd) {
      return "Global";
    }
    try {
      const res = await this.exec("git config --local user.email", cwd);
      if (res.stdout && res.stdout.trim() !== "") {
        return "Local";
      }
      return "Global";
    } catch {
      return "Global";
    }
  }

  public static async getCurrentConfig(cwd?: string): Promise<GitConfigValues> {
    const config: GitConfigValues = {};

    try {
      const res = await this.exec("git config user.name", cwd);
      config.name = res.stdout;
    } catch {
      try {
        const res = await this.exec("git config --global user.name");
        config.name = res.stdout;
      } catch {}
    }

    try {
      const res = await this.exec("git config user.email", cwd);
      config.email = res.stdout;
    } catch {
      try {
        const res = await this.exec("git config --global user.email");
        config.email = res.stdout;
      } catch {}
    }

    try {
      const res = await this.exec("git config user.signingkey", cwd);
      config.signingKey = res.stdout;
    } catch {
      try {
        const res = await this.exec("git config --global user.signingkey");
        config.signingKey = res.stdout;
      } catch {}
    }

    try {
      const res = await this.exec("git config commit.gpgsign", cwd);
      config.gpgSign = res.stdout.toLowerCase() === "true";
    } catch {
      try {
        const res = await this.exec("git config --global commit.gpgsign");
        config.gpgSign = res.stdout.toLowerCase() === "true";
      } catch {
        config.gpgSign = false;
      }
    }

    return config;
  }

  public static async getGlobalConfig(): Promise<GitConfigValues> {
    const config: GitConfigValues = {};

    try {
      const res = await this.exec("git config --global user.name");
      config.name = res.stdout;
    } catch {}

    try {
      const res = await this.exec("git config --global user.email");
      config.email = res.stdout;
    } catch {}

    try {
      const res = await this.exec("git config --global user.signingkey");
      config.signingKey = res.stdout;
    } catch {}

    try {
      const res = await this.exec("git config --global commit.gpgsign");
      config.gpgSign = res.stdout.toLowerCase() === "true";
    } catch {
      config.gpgSign = false;
    }

    return config;
  }

  public static async applyProfile(
    profile: {
      name: string;
      email: string;
      signingKey?: string;
      gpgSign: boolean;
    },
    global: boolean,
    cwd?: string
  ): Promise<void> {
    const scope = global ? "--global" : "";

    await this.exec(
      `git config ${scope} user.name ${this.escapeArg(profile.name)}`,
      global ? undefined : cwd
    );

    await this.exec(
      `git config ${scope} user.email ${this.escapeArg(profile.email)}`,
      global ? undefined : cwd
    );

    if (profile.signingKey && profile.signingKey.trim() !== "") {
      await this.exec(
        `git config ${scope} user.signingkey ${this.escapeArg(profile.signingKey.trim())}`,
        global ? undefined : cwd
      );
    } else {
      try {
        await this.exec(
          `git config ${scope} --unset user.signingkey`,
          global ? undefined : cwd
        );
      } catch (err: any) {
        const code = err.error?.code;
        if (code !== 5) {
          throw err;
        }
      }
    }

    await this.exec(
      `git config ${scope} commit.gpgsign ${profile.gpgSign ? "true" : "false"}`,
      global ? undefined : cwd
    );
  }

  public static async unsetLocalConfig(cwd: string): Promise<void> {
    const keys = [
      "user.name",
      "user.email",
      "user.signingkey",
      "commit.gpgsign",
    ];
    for (const key of keys) {
      try {
        await this.exec(`git config --local --unset ${key}`, cwd);
      } catch (err: any) {
        const code = err.error?.code;
        if (code !== 5) {
          throw err;
        }
      }
    }
  }
}
