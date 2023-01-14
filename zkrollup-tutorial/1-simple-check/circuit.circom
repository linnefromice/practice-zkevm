pragma circom 2.0.0;

template SimpleChecks() {
    signal input a;
    signal input b;
    signal input c;
    signal input d;
    signal output out;

    a + b === c;
    b * c === d;
    out <== c + d;
}

component main = SimpleChecks();
