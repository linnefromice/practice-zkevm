pragma circom 2.0.0;

template SimpleChecks(k) {
    signal input a[k];
    signal input b[k];
    signal input c[k];
    signal input d[k];
    signal output out;

    var sum = 0;
    for (var i = 0; i < k; i++) {
        a[i] + b[i] === c[i];
        b[i] * c[i] === d[i];
        sum += c[i] + d[i];
    }
    out <== sum;
}

component main = SimpleChecks(4);