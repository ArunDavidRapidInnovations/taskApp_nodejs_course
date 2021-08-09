const c = async () => {
  const a = async (a, b) => {
    console.log(a, b);
    setTimeout(() => {}, 1000);
    return a + b;
  };
  console.log(await a(15, 20));
};

c();
