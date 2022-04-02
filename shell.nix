{ pkgs ? import <nixpkgs> {} }:
with pkgs;

stdenv.mkDerivation {
  buildInputs = [ nodejs-16_x ];
  name = "stripe-stateful-mock";
}
