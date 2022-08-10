const express = require("express");
const { v4: uuidV4 } = require("uuid");

const app = express();

app.use(express.json());

/**
 * --== CostumersTable ==--
 * name: string
 * cpf: string
 * id: uuid
 * statement: []
 */

const costumers = [];

//Middleware
function verifyIfExistsAccountByCPF(req, res, next) {
  const { cpf } = req.headers;
  const costumer = costumers.find((costumer) => (costumer.cpf = cpf));

  if (!costumer) {
    return res.status(404).json({ error: "Costumer not found!" });
  }

  req.costumer = costumer;
  next();
}

app.get("/costumers/account", verifyIfExistsAccountByCPF, (req, res) => {
  const { costumer } = req;
  return res.status(200).json(costumer.statement);
});

app.get(
  "/costumers/account/statement",
  verifyIfExistsAccountByCPF,
  (req, res) => {
    const { costumer } = req;
    return res.status(200).json(costumer.statement);
  }
);

app.post("/costumers/account", (req, res) => {
  const { cpf, name } = req.body;

  const costumerAlreadyExists = costumers.some(
    (costumer) => costumer.cpf === cpf
  );

  if (costumerAlreadyExists) {
    return res.status(400).json({ error: "Costumer already exists!" });
  }

  costumers.push({ id: uuidV4(), cpf, name, statement: [] });
  return res.status(201).send("Account created");
});

app.post(
  "/costumers/account/deposit",
  verifyIfExistsAccountByCPF,
  (req, res) => {
    const { costumer } = req;
    const { description, amount } = req.body;

    const statementOperation = {
      description,
      amount,
      createdAt: new Date(),
      type: "deposit",
      id: uuidV4(),
    };

    costumer.statement.push(statementOperation);

    return res.status(201).send(`$${amount} credited in your account!`);
  }
);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
