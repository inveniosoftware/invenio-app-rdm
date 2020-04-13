import { DepositApiClient } from "../../../react_invenio_deposit";

export class RDMDepositApiClient extends DepositApiClient {
  constructor() {
    super();
    console.log("RDM Deposit Api client");
  }
}
