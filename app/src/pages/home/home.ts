import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { FormGroup, FormArray, Validators, FormBuilder } from '@angular/forms';

import * as jsPdf from 'jspdf';
import 'jspdf-autotable' 
import {img} from './base_img'

import * as moment from 'moment';


declare var jsPDF: any; // Important

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  base64textString: string
  invoiceForm: FormGroup;
  balance: number;
  //image = require('../../assets/second-logo.png')
  constructor(public navCtrl: NavController, private formBuilder: FormBuilder) {

    this.invoiceForm = this.formBuilder.group({
      client_fullname: ['Rafal Luberda', [Validators.required]],
      date_of_issue: [new Date().toISOString(), [Validators.required]],
      invoice_number: ['01234', [Validators.required]],
      street: ['7642 Kedzie', [Validators.required]],
      city: ['Niles ', [Validators.required]],
      state: ['IL ', [Validators.required]],
      zip: ['60714', [Validators.required]],
      balance: [0, [Validators.required]],
      items: this.formBuilder.array([
        this.initializeItems()
      ]),
    })

    const invoice_number = this.generateInvoiceNumber()
    this.invoiceForm.controls['invoice_number'].setValue(invoice_number)
    
  }

  initializeItems(){
    return this.formBuilder.group({
            title: ['', Validators.required],
            val: ['']
        });
  }

  generateInvoiceNumber(){
    return Math.floor(Math.random() *90000) + 10000
  }

  addItem(){
    const control = <FormArray> this.invoiceForm.controls['items']
    control.push(this.initializeItems());
    
  }

  onBlur(value){
    const total =  this.getTotal(value);
    console.log('total', total);
    this.invoiceForm.controls['balance'].setValue(total)
  }

  getTotal(value){
    console.log('value', value)
    value = parseInt(value);
    const control = <FormArray> this.invoiceForm.controls['items']
    let sumArrays = control.value.map((item)=> {
      console.log('item val', item.val)
      if(item.val.length == 0){
        item.val = 0;
        return parseFloat(item.val);
      }else{
        return parseFloat(item.val);
      }
      
      
      
    })
    console.log('sum arrays', sumArrays)
    const total = sumArrays.reduce(function(acc, val) {
      console.log('acc and val', acc, val)
      return acc + val;
    }, 0);
    return total 
    
  }

  generateInvoice(form){
    //import '../../assets/second-logo.png'
    let base64Img = img;
    let street_position_vertical = 20;
    let city_position_vertical = 5 + street_position_vertical;
    let state_position_vertical = 5 + city_position_vertical;
    let zip_position_vertical = 5 + state_position_vertical;

    let company_position_vertical = 25 + zip_position_vertical;
    let address1_position_vertical = 5 + company_position_vertical;
    let address2_position_vertical = 5 + address1_position_vertical;


    let items_position_vertical = 25 + address2_position_vertical;
    let totals_position_vertical = 40 + items_position_vertical;
    let balance_position_vertical = 20 + totals_position_vertical;

    let doc = new jsPdf();
    doc.setFontSize(9);
    doc.text(14, street_position_vertical, 'WebVision' );
    doc.text(14, city_position_vertical, '7642 W Kedzie St');
    doc.text(14, state_position_vertical, 'Niles IL 60714');


    doc.text(14, company_position_vertical, form.value.client_fullname);
    doc.text(14, address1_position_vertical, `${form.value.street}`);
    doc.text(14, address2_position_vertical,`${form.value.city}`);
    doc.text(14, address2_position_vertical + 5, `${form.value.state} ${form.value.zip}`);


    doc.addImage(base64Img, 'JPEG', 140, 20, 40, 20);

    let now = moment(form.value.date_of_issue).format('MMMM DD, YYYY');

    doc.text(122, company_position_vertical, 'Invoice # ');
    doc.text(186, company_position_vertical, `${form.value.invoice_number}`);
    doc.text(122, company_position_vertical + 5, 'Invoice Date');
    doc.text(175, company_position_vertical + 5, `${now}`);

    
    let columns = [
      {title:"Time Entry Notes", dataKey: "name"},
      {title:"Line Total", dataKey: "total"},
      ];
    let rows = [{name:"Time Entry Notes", total: "Line Total"}]
    form.value.items.forEach((obj)=>{
      obj['name'] = obj.title;
      obj['total'] = `${obj.val}.00`;
      rows.push(obj)
      //return obj;
    })
    doc.autoTable(columns, rows, {
      startY: items_position_vertical,
      theme: 'grid',
      margin: {left: 14},
      showHeader: 'never',
      styles: {
        lineColor: [181, 185, 191],
        //lineWidth: 1
      },
      drawCell: function (cell, data) {
         if(data.row.index == 0){
            doc.setFillColor(181, 185, 191);
            doc.setTextColor(0, 0, 0);
            doc.setFontType('bold'); 
          }

          if(data.row.index % 2 == 0 &&  !(data.row.index == 0)){
            doc.setFillColor(255, 255, 255);
            console.log('data row 2', data.row)
            //data.row.y = 0
            
          }

          if(data.row.index % 2 != 0 &&  !(data.row.index == 0)){
            doc.setFillColor(255, 255, 255);
            console.log('data row 1', data.row)
            //data.row.y  = 0
            //data.row.cells.total.x = 0
            //data.row.cells.total.y = 0
          }

      },
      columnStyles: {
        name: {
                halign: 'left',
                columnWidth: 140,
                overflow: 'linebreak'
          
            },
        total: {
                halign: 'right',
              
            }
        },
      headerStyles:{
        halign: 'center',
      }

    })

    

    //let columns_for_total = ["Total", `${form.value.balance}`];
    let columns_for_total = [
      {title:"Total", dataKey: "name"},
      {title:`${form.value.balance}.00`, dataKey: "total"},
    ];
    let rows_for_total = [
      {name:"Total", total: `${form.value.balance}.00`},
      {name: "Amount Paid", total: "0.00"}
    ];

    doc.autoTable(columns_for_total, rows_for_total, {
      startY: doc.autoTable.previous.finalY + 5,
      margin: {left: 80},
      showHeader: 'never',
      drawCell: function (cell, data) {
         if(data.row.index == 0){
            doc.setFillColor(255, 255, 2555);
            doc.setTextColor(0, 0, 0);
            doc.setFontType('bold')
          }
      },
      columnStyles: {
        name: {
                halign: 'left',
        },
        total: {
                halign: 'right',
          }
        },
        
    })

    let columns_for_balance = [
      {title:"Total", dataKey: "name"},
      {title:`${form.value.balance}`, dataKey: "total"},
      ];
    let rows_for_balance = [{name:"Balance Due (USD)", total: `$${form.value.balance}.00`} ];

    doc.autoTable(columns_for_balance, rows_for_balance, {
      startY: doc.autoTable.previous.finalY + 2,
      theme: 'grid',
      styles: {
        //lineColor: [181, 185, 191],
        lineColor: [244, 247, 252],
        lineWidth: 0.5
        
      },
      
      margin: {left: 80},
      showHeader: 'never',
      columnStyles: {
        name: {
                halign: 'left',
        },
        total: {
                halign: 'right',
          }
        },
      drawCell: function (cell, data) {
        if(data.row.index == 0){
          doc.setFillColor(181, 185, 191);
          doc.setTextColor(0, 0, 0);
          doc.setFontType('bold')
        }
      },
    })

    let columns_for_first_balance = ["Balance Due (USD)", `$${form.value.balance}.00`];
    let rows_for_first_balance = [ ];

    doc.autoTable(columns_for_balance , rows_for_balance, {
      startY: company_position_vertical + 7,
      theme: 'grid',
      margin: {left: 120},
      styles: {
        //lineColor: [181, 185, 191],
        lineColor: [244, 247, 252],
        lineWidth: 0.5
      },
      showHeader: 'never',
      columnStyles: {
        name: {
                halign: 'left',
        },
        total: {
                halign: 'right',
          }
        },
      drawCell: function (cell, data) {
        if(data.row.index == 0){
          doc.setFillColor(181, 185, 191);
          doc.setTextColor(0, 0, 0);
          doc.setFontType('bold')
        }
      },
    })


    doc.save(form.value.invoice_number);    

    const invoice_number = this.generateInvoiceNumber()
    this.invoiceForm.controls['invoice_number'].setValue(invoice_number)
        
    
  }

  

}
