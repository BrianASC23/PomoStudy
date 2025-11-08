{
  description = "CSE310 dev shell";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";

  outputs = { self, nixpkgs }: {
    devShells.x86_64-linux.default = 
      let
        pkgs = import nixpkgs {
          system = "x86_64-linux";
        };
      in pkgs.mkShell {
        buildInputs = with pkgs; [
          python313
          # python310Packages.pandas
          # python310Packages.numpy
          # python312Packages.keyring
          uv
        ];

        shellHook = ''
          exec fish -C "source .venv/bin/activate.fish"
        '';
      };
  };
}

