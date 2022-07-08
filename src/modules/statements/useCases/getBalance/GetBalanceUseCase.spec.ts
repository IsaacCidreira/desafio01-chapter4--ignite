import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { GetBalanceError } from "../getBalance/GetBalanceError";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
  });

  describe("Get balance", () => {
    it("should be able to get a balance", async () => {
      const user = await usersRepository.create({
        email: "user@test.com",
        name: "usertest",
        password: "test",
      });

      const deposit = await statementsRepository.create({
        amount: 100,
        description: "test",
        type: OperationType.DEPOSIT,
        user_id: user.id as string,
      });

      const withdraw = await statementsRepository.create({
        amount: 70,
        description: "test",
        type: OperationType.WITHDRAW,
        user_id: user.id as string,
      });

      const balance = await getBalanceUseCase.execute({
        user_id: user.id as string,
      });

      expect(balance).toStrictEqual({
        statement: [deposit, withdraw],
        balance: 30,
      });
    });
  });

  it("should not be able to get a balance with a non-existent user", async () => {
    expect(async () => {
      await statementsRepository.create({
        amount: 100,
        description: "test",
        type: OperationType.DEPOSIT,
        user_id: "non-existent",
      });

      await getBalanceUseCase.execute({
        user_id: "non-existent",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
