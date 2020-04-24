import { DepositApiController } from "../../../react_invenio_deposit";

export class RDMDepositApiController extends DepositApiController {
  constructor(apiClient) {
    super(apiClient);
    console.log("RDM Deposit Controller");
  }
}
