import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateStatementUseCase } from "./CreateStatementUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { amount, description } = request.body;
    const { user_id: sender_id } = request.params;

    const splittedPath = request.originalUrl.split("/");
    const verifyType = sender_id === undefined;
    let type;
    if (verifyType) {
      type = splittedPath[splittedPath.length - 1] as OperationType;
    } else {
      type = splittedPath[splittedPath.length - 2] as OperationType;
      console.log(type);
    }
    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id,
      type,
      amount,
      description,
      sender_id,
    });

    return response.status(201).json(statement);
  }
}
