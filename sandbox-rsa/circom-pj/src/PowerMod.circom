pragma circom 2.0.0;

// base ** exp (mod modulus)
template PowerMod() {
    signal input base;
    signal input exp;
    signal input modulus;
    signal output out;

    var multipled = base ** exp;
    out <-- multipled % modulus;
}

component main = PowerMod();
