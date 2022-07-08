import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
describe("Create a Statement", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to create a deposit", async () => {
    const user = await createUserUseCase.execute({
      email: "user@test.com",
      name: "test",
      password: "password",
    });

    const deposit = await createStatementUseCase.execute({
      amount: 100,
      description: "test",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    expect(deposit).toHaveProperty("id");
    expect(deposit.amount).toEqual(100);
  });

  it("Should not be able to create a deposit without a user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 100,
        description: "test",
        type: OperationType.DEPOSIT,
        user_id: "no-existent",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should be able to create a withdraw", async () => {
    const user = await createUserUseCase.execute({
      email: "user@test.com",
      name: "test",
      password: "password",
    });

    await createStatementUseCase.execute({
      amount: 100,
      description: "test",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    const withdraw = await createStatementUseCase.execute({
      amount: 70,
      description: "test",
      type: OperationType.WITHDRAW,
      user_id: user.id as string,
    });

    expect(withdraw).toHaveProperty("id");
    expect(withdraw.amount).toBe(70);
  });

  it("Should not be able to create a withdraw without a user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 100,
        description: "test",
        type: OperationType.WITHDRAW,
        user_id: "no-existent",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a withdraw statement with funds", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        email: "user@test.com",
        name: "test",
        password: "password",
      });
      await createStatementUseCase.execute({
        amount: 100,
        description: "test",
        type: OperationType.WITHDRAW,
        user_id: user.id as string,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
