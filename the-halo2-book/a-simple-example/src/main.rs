use halo2_proofs::{pasta::Fp, dev::MockProver, plonk::{Circuit, Error, Column, Advice, Selector, Instance, ConstraintSystem, Fixed}, circuit::{SimpleFloorPlanner, Layouter, AssignedCell, Chip}, poly::Rotation};

trait Ops {
    type Num;
    fn load_private(&self, layouter: impl Layouter<Fp>, x: Option<Fp>) -> Result<Self::Num, Error>;
    fn load_constant(&self, layouter: impl Layouter<Fp>, x: Fp) -> Result<Self::Num, Error>;
    fn mul(&self, layouter: impl Layouter<Fp>, a: Self::Num, b: Self::Num) -> Result<Self::Num, Error>;
    fn add(&self, layouter: impl Layouter<Fp>, a: Self::Num, b: Self::Num) -> Result<Self::Num, Error>;
    fn expose_public(&self, layouter: impl Layouter<Fp>, num: Self::Num, row: usize) -> Result<(), Error>;
}

struct MyChip {
    config: MyConfig
}

impl Chip<Fp> for MyChip {
    type Config = MyConfig;

    type Loaded = ();

    fn config(&self) -> &Self::Config { &self.config }

    fn loaded(&self) -> &Self::Loaded {
        todo!()
    }
}

impl Ops for MyChip {
    type Num = AssignedCell<Fp, Fp>;

    fn load_private(&self, mut layouter: impl Layouter<Fp>, x: Option<Fp>) -> Result<Self::Num, Error> {
        let config = self.config();
        layouter.assign_region(
            || "load private",
            |mut region| {
                region
                    .assign_advice(|| "private value", config.advice[0], 0, || x.ok_or(Error::Synthesis))
            }
        )
    }

    fn load_constant(&self, mut layouter: impl Layouter<Fp>, x: Fp) -> Result<Self::Num, Error> {
        let config = self.config();
        layouter.assign_region(
            || "load private",
            |mut region| {
                region
                    .assign_advice_from_constant(|| "constant", config.advice[0], 0, x)
            }
        )
    }

    fn mul(&self, mut layouter: impl Layouter<Fp>, a: Self::Num, b: Self::Num) -> Result<Self::Num, Error> {
        let config = self.config();
        layouter.assign_region(
            || "mul",
            |mut region| {
                config.s_mul.enable(&mut region, 0)?;
                a.copy_advice(|| "lhs", &mut region, config.advice[0], 0)?;
                b.copy_advice(|| "rhs", &mut region, config.advice[1], 0)?;
                let v = a.value().and_then(|a| b.value().map(|b| *a * *b));
                region.assign_advice(|| "a * b", config.advice[0], 1, || v.ok_or(Error::Synthesis))
            }
        )
    }

    fn add(&self, mut layouter: impl Layouter<Fp>, a: Self::Num, b: Self::Num) -> Result<Self::Num, Error> {
        let config = self.config();
        layouter.assign_region(
            || "add",
            |mut region| {
                config.s_add.enable(&mut region, 0)?;
                a.copy_advice(|| "lhs", &mut region, config.advice[0], 0)?;
                b.copy_advice(|| "rhs", &mut region, config.advice[1], 0)?;
                let v = a.value().and_then(|a| b.value().map(|b| *a + *b));
                region.assign_advice(|| "a + b", config.advice[0], 1, || v.ok_or(Error::Synthesis))
            }
        )
    }

    fn expose_public(&self, mut layouter: impl Layouter<Fp>, num: Self::Num, row: usize) -> Result<(), Error> {
        let config = self.config();
        layouter.constrain_instance(num.cell(), config.instance, row)
    }
}

impl MyChip {
    fn new(config: MyConfig) -> Self {
        MyChip { config, }
    }

    fn configure(meta: &mut ConstraintSystem<Fp>, advice: [Column<Advice>; 2], instance: Column<Instance>, constant: Column<Fixed>) -> MyConfig {
        meta.enable_equality(instance);
        meta.enable_constant(constant);
        for column in &advice {
            meta.enable_equality(*column);
        }
        let s_mul = meta.selector();
        let s_add = meta.selector();

        meta.create_gate("mul", |meta| {
            let lhs = meta.query_advice(advice[0], Rotation::cur());
            let rhs = meta.query_advice(advice[1], Rotation::cur());
            let out = meta.query_advice(advice[0], Rotation::next());
            let s_mul = meta.query_selector(s_mul);
            let s_add = meta.query_selector(s_add);

            vec![
                s_mul * (lhs.clone() * rhs.clone() - out.clone()),
                s_add * (lhs + rhs - out)
            ]
        });

        MyConfig {
            advice,
            instance,
            s_mul,
            s_add
        }
    }
}

#[derive(Clone, Debug)]
struct MyConfig {
    advice: [Column<Advice>; 2],
    instance: Column<Instance>,
    s_mul: Selector,
    s_add: Selector,
}

#[derive(Default)]
struct MyCircuit {
    constant: Fp,
    x: Option<Fp>,
}

impl Circuit<Fp> for MyCircuit {
    type Config = MyConfig;
    type FloorPlanner = SimpleFloorPlanner;

    fn without_witnesses(&self) -> Self { Self::default() }

    fn configure(meta: &mut halo2_proofs::plonk::ConstraintSystem<Fp>) -> Self::Config {
        let advice = [meta.advice_column(), meta.advice_column()];
        let instance = meta.instance_column();
        let constant = meta.fixed_column();
        MyChip::configure(meta, advice, instance, constant)
    }

    // x^3 + x + 5 = 35
    // x2 = x * x
    // x3 = x * x * x
    // x3_x = x3 + x
    // x3_x_5 = x3_x + 5
    // x3_x_5 == 35 // <- expose_public
    fn synthesize(&self, config: Self::Config, mut layouter: impl halo2_proofs::circuit::Layouter<Fp>) -> Result<(), halo2_proofs::plonk::Error> {
        let chip = MyChip::new(config);
        let x = chip.load_private(layouter.namespace(|| "load x"), self.x)?;
        let constant = chip.load_constant(layouter.namespace(|| "load constant"), self.constant)?;

        let x2 = chip.mul(layouter.namespace(|| "x2"), x.clone(), x.clone())?;
        let x3 = chip.mul(layouter.namespace(|| "x3"), x2.clone(), x.clone())?;
        let x3_x = chip.add(layouter.namespace(|| "x3+x"), x3.clone(), x.clone())?;
        let x3_x_5 = chip.add(layouter.namespace(|| "x3+x+5"), x3_x.clone(), constant.clone())?;
        
        chip.expose_public(layouter.namespace(|| "expose res"), x3_x_5, 0)
    }
}

fn main() {
    // change these values if control test results
    let x = Fp::from(3); 
    let constant = Fp::from(5);
    let res = Fp::from(35);

    let circuit = MyCircuit {
        constant,
        x: Some(x),
    };

    let public_inputs = vec![res];

    let prover = MockProver::run(4, &circuit, vec![public_inputs.clone()]).unwrap();
    assert_eq!(prover.verify(), Ok(()));
}
