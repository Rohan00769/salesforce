import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getExpenseTypePicklistValues from '@salesforce/apex/ExpenseController.getExpenseTypePicklistValues';
import createExpenseRecord from '@salesforce/apex/ExpenseController.createExpenseRecord';

export default class ExpenseCreationForm extends LightningElement {
  @track expenseDescription = '';
  @track expenseType = '';
  @track expenseAmount = '';
  @track expenseDate = '';
  
  @track expenseTypeOptions = [];

  // Fetch Expense Type picklist values from Apex
  @wire(getExpenseTypePicklistValues)
  wiredExpenseTypeOptions({ error, data }) {
    if (data) {
      this.expenseTypeOptions = data.map(value => ({
        label: value,
        value: value
      }));
    } else if (error) {
      console.error('Error fetching Expense Type picklist values:', error);
    }
  }

  // Handle Description input change
  handleDescriptionChange(event) {
    this.expenseDescription = event.target.value;
  }

  // Handle Expense Type change
  handleExpenseTypeChange(event) {
    this.expenseType = event.target.value;
  }

  // Handle Amount input change
  handleAmountChange(event) {
    this.expenseAmount = event.target.value;
  }

  // Handle Date input change
  handleDateChange(event) {
    this.expenseDate = event.target.value;
  }

  // Handle form submission
  handleSubmit() {
    
    // Basic Validation
    if (!this.expenseDescription || !this.expenseType || !this.expenseAmount || !this.expenseDate) {
      this.showToast('Error', 'All fields are required', 'error');
      return;
    }

    if (this.expenseAmount <= 0) {
      this.showToast('Error', 'Amount must be greater than zero', 'error');
      return;
    }

    // Call Apex to create an Expense record
    createExpenseRecord({
      expenseDescription: this.expenseDescription,
      expenseType: this.expenseType,
      expenseAmount: this.expenseAmount,
      expenseDate: this.expenseDate
    })
      .then((result) => {
        this.showToast('Success', 'Expense created successfully!', 'success');
        this.clearForm();
      })
      .catch((error) => {
        this.showToast('Error', `Error creating expense: ${error.body.message}`, 'error');
      });
  }

  // Display toast notifications
  showToast(title, message, variant) {
    const evt = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant,
    });
    this.dispatchEvent(evt);
  }

  // Clear the form fields after success
  clearForm() {
    this.expenseDescription = '';
    this.expenseType = '';
    this.expenseAmount = '';
    this.expenseDate = '';
  }
}
