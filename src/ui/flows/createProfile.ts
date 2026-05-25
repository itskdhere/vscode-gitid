import * as vscode from "vscode";
import { GitProfile } from "../../models/gitProfile";
import { ProfileManager } from "../../services/profileManager";

export async function createProfileFlow(
  pm: ProfileManager,
  prepopulated?: Partial<GitProfile>
): Promise<GitProfile | undefined> {
  const alias = await vscode.window.showInputBox({
    prompt: "Enter profile alias (e.g. Work, Personal, Freelance)",
    placeHolder: "Personal",
    value: prepopulated?.alias || "",
    validateInput: (value) => {
      if (!value || value.trim() === "") {
        return "Alias is required";
      }
      const duplicate = pm
        .getProfiles()
        .find((p) => p.alias.toLowerCase() === value.trim().toLowerCase());
      if (duplicate) {
        return `A profile with the alias "${value.trim()}" already exists.`;
      }
      return null;
    },
  });
  if (!alias) {
    return undefined;
  }

  const name = await vscode.window.showInputBox({
    prompt: "Enter Git user.name",
    placeHolder: "John Doe",
    value: prepopulated?.name || "",
    validateInput: (value) => {
      if (!value || value.trim() === "") {
        return "Name is required";
      }
      return null;
    },
  });
  if (!name) {
    return undefined;
  }

  const email = await vscode.window.showInputBox({
    prompt: "Enter Git user.email",
    placeHolder: "john.doe@example.com",
    value: prepopulated?.email || "",
    validateInput: (value) => {
      if (!value || value.trim() === "") {
        return "Email is required";
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        return "Enter a valid email address";
      }
      return null;
    },
  });
  if (!email) {
    return undefined;
  }

  const signingKey = await vscode.window.showInputBox({
    prompt: "Enter Git user.signingkey (Optional - leave blank if none)",
    placeHolder: "e.g., ABC123",
    value: prepopulated?.signingKey || "",
  });

  const hasPrepopulated = !!prepopulated;
  const isGpgSign = !!prepopulated?.gpgSign;
  const hasSigningKey = !!(signingKey && signingKey.trim() !== "");

  const gpgOptions = [
    {
      label: hasPrepopulated && !isGpgSign ? "No (Current)" : "No",
      description: "Disable GPG signing (commit.gpgsign = false)",
      value: false,
    },
    {
      label: hasPrepopulated && isGpgSign ? "Yes (Current)" : "Yes",
      description: "Enable GPG signing (commit.gpgsign = true)",
      value: true,
    },
  ];

  const shouldYesBeFirst = hasPrepopulated ? isGpgSign : hasSigningKey;

  if (shouldYesBeFirst) {
    gpgOptions.reverse();
  }

  const placeHolderText = hasPrepopulated
    ? `Enable GPG signing for this identity? (Currently: ${prepopulated.gpgSign ? "Yes" : "No"})`
    : "Enable GPG signing for this identity?";

  const gpgSignPick = await vscode.window.showQuickPick(gpgOptions, {
    placeHolder: placeHolderText,
  });
  if (!gpgSignPick) {
    return undefined;
  }

  const newProfile: GitProfile = {
    id: Date.now().toString(),
    alias: alias.trim(),
    name: name.trim(),
    email: email.trim(),
    signingKey:
      signingKey && signingKey.trim() !== "" ? signingKey.trim() : undefined,
    gpgSign: gpgSignPick.value,
  };

  await pm.saveProfile(newProfile);
  vscode.window.showInformationMessage(
    `GitID: Profile "${newProfile.alias}" created.`
  );
  return newProfile;
}
