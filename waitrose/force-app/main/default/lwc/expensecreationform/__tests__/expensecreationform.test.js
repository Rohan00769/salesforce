import { LightningElement, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';  // Correct import for object info
import { getPicklistValues } from 'lightning/uiFieldApi';  // Correct import for picklist values
import createExpense from '@salesforce/apex/ExpenseController.createExpense';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Import the Expense object and the Expense_Type picklist field
import EXPENSE_OBJECT from '@salesforce/schema/Expense__c'; 
import EXPENSE_TYPE_FIELD from '@salesforce/schema/Expense__c.Expense_Type__c';

export default class ExpenseForm extends LightningElement {
    @track expenseType = ''; // For selected Expense Type
    @track amount = ''; // For Expense amount
    @track date = ''; // For Expense date
    @track description = ''; // For Expense description
    @track expenseTypeOptions = []; // To hold picklist options for Expense Type

    // Wire to get object information for Expense__c
    @wire(getObjectInfo, { objectApiName: EXPENSE_OBJECT })
    objectInfo;

    // Wire to get picklist values for the Expense_Type__c field
    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data?.defaultRecordTypeId', // Safely access the recordTypeId
        fieldApiName: EXPENSE_TYPE_FIELD // Picklist field for Expense_Type__c
    })
    expenseTypePicklistValues({ data, error }) {
        if (data) {
            // Map the picklist values into an array of label/value pairs
            this.expenseTypeOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        } else if (error) {
            this.showToast('Error', 'Error fetching picklist values: ' + error.body.message, 'error');
        }
    }

    // Handle input change for form fields
    handleInputChange(event) {
        const field = event.target.name;
        if (field === 'expenseType') {
            this.expenseType = event.target.value;
        } else if (field === 'amount') {
            this.amount = event.target.value;
        } else if (field === 'date') {
            this.date = event.target.value;
        } else if (field === 'description') {
            this.description = event.target.value;
        }
    }

    // Handle form submission
    handleSubmit() {
        // Validate form fields
        if (!this.expenseType || !this.amount || !this.date || !this.description) {
            this.showToast('Error', 'All fields are required.', 'error');
            return;
        }

        // Call Apex method to create an expense record
        createExpense({
            expenseType: this.expenseType,
            amount: this.amount,
            expenseDate: this.date,
            description: this.description
        })
            .then(result => {
                // Show success toast
                this.showToast('Success', 'Expense created successfully!', 'success');
                // Clear form fields after submission
                this.expenseType = '';
                this.amount = '';
                this.date = '';
                this.description = '';
            })
            .catch(error => {
                // Show error toast
                this.showToast('Error', 'Error creating expense: ' + error.body.message, 'error');
            });
    }

    // Helper method to show toast notifications
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}
