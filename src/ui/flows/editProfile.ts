import * as vscode from "vscode";
import { GitProfile } from "../../models/gitProfile";
import { ProfileManager } from "../../services/profileManager";

export async function editProfileFlow(
  pm: ProfileManager,
  profile: GitProfile
): Promise<void> {
  const alias = await vscode.window.showInputBox({
    prompt: "Edit profile alias",
    value: profile.alias,
    validateInput: (value) => {
      if (!value || value.trim() === "") {
        return "Alias is required";
      }
      const duplicate = pm
        .getProfiles()
        .find(
          (p) =>
            p.id !== profile.id &&
            p.alias.toLowerCase() === value.trim().toLowerCase()
        );
      if (duplicate) {
        return `A profile with the alias "${value.trim()}" already exists.`;
      }
      return null;
    },
  });
  if (!alias) {
    return;
  }

  const name = await vscode.window.showInputBox({
    prompt: "Edit user.name",
    value: profile.name,
    validateInput: (value) => {
      if (!value || value.trim() === "") {
        return "Name is required";
      }
      return null;
    },
  });
  if (!name) {
    return;
  }

  const email = await vscode.window.showInputBox({
    prompt: "Edit user.email",
    value: profile.email,
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
    return;
  }

  const signingKey = await vscode.window.showInputBox({
    prompt: "Edit user.signingkey (Optional)",
    value: profile.signingKey || "",
  });

  const isGpgSign = !!profile.gpgSign;
  const hasSigningKey = !!(signingKey && signingKey.trim() !== "");

  const gpgOptions = [
    {
      label: !isGpgSign ? "No (Current)" : "No",
      description: "Disable GPG signing (commit.gpgsign = false)",
      value: false,
    },
    {
      label: isGpgSign ? "Yes (Current)" : "Yes",
      description: "Enable GPG signing (commit.gpgsign = true)",
      value: true,
    },
  ];

  if (hasSigningKey) {
    gpgOptions.reverse();
  }

  const gpgSignPick = await vscode.window.showQuickPick(gpgOptions, {
    placeHolder: `Enable GPG signing? (Currently: ${isGpgSign ? "Yes" : "No"})`,
  });
  if (!gpgSignPick) {
    return;
  }

  const updatedProfile: GitProfile = {
    id: profile.id,
    alias: alias.trim(),
    name: name.trim(),
    email: email.trim(),
    signingKey:
      signingKey && signingKey.trim() !== "" ? signingKey.trim() : undefined,
    gpgSign: gpgSignPick.value,
  };

  await pm.saveProfile(updatedProfile);
  vscode.window.showInformationMessage(
    `GitID: Profile "${updatedProfile.alias}" updated.`
  );
}
