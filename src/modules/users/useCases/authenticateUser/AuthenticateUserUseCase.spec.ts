import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: InMemoryUsersRepository;
let createUsersUseCase: CreateUserUseCase;
let authenticateUserUsecase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUsersUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUsecase = new AuthenticateUserUseCase(usersRepository);
  });

  // const user = {
  //   email: "test@test.com",
  //   name: "test",
  //   password: "1234",
  // };
  // it("should be able to authenticate", async () => {
  //   await createUsersUseCase.execute(user);

  //   const response = await authenticateUserUsecase.execute({
  //     email: user.email,
  //     password: user.password,
  //   });

  //   console.log(user);
  //   // expect(response).toHaveProperty("token");
  //   // expect(response).toHaveProperty("user");
  // });

  it("should be able to authenticate", async () => {
    await usersRepository.create({
      email: "test@test.com",
      name: "test",
      password: await hash("1234", 8),
    });

    const response = await authenticateUserUsecase.execute({
      email: "test@test.com",
      password: "1234",
    });

    expect(response).toHaveProperty("token");
    expect(response).toHaveProperty("user");
  });

  it("should not be able to authenticate a user with incorrect credentials", async () => {
    expect(async () => {
      await authenticateUserUsecase.execute({
        email: "non@existent.com",
        password: "non-existent",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
