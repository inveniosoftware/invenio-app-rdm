import { DepositController } from "../../../react_invenio_deposit";

export class RDMDepositController extends DepositController {
  constructor(apiClient) {
    super(apiClient);
    console.log("RDM Deposit Controller");
  }
}
