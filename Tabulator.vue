<template>
	<div id='table'></div>
</template>

<script>
// npm install tabulator-tables --save
const Tabulator = require('tabulator-tables');
var cols = Tabulator.getColumns();
var rows = Tabulator.getRows();

export var time = '';
export default {
  data() {
    return {
      tabulator: null,
      tableColumn: [
        {rowHandle:true, formatter:"handle", headerSort:false, frozen:true, width:30, minWidth:30},
      {title: 'Sunday', field: 'su', align: 'center',
      headerClick:function(e, column){
      //e - the click event object
      //column - column component
      },
      cellClick: function(e, cell){time=time+cell.getValue()+' '+cell.getColumn().getField()+' ';console.log(time)},
      }, 
      {title: 'Monday', field: 'm', align: 'center',
        cellClick: function(e, cell){console.log(cell.getValue()); console.log(cell.getColumn().getField());
        alert("The cell has a value of:" + cell.getValue()); },//display the cells value
        
        // formatter:"tickCross",
      }, 
      {title: 'Tuesday', field: 't', align: 'center',
        cellClick: function(e, cell){console.log(cell.getValue()); console.log(cell.getField());},
        //var row = cell.getRow();
      }, 
      {title: 'Wednesday', field: 'w', align: 'center',
        cellClick: function(e, cell){console.log(cell.getValue()); console.log(cell.getColumn().getField());},
      }, 
      {title: 'Thursday', field: 'th', align: 'center',
        cellClick: function(e, cell){console.log(cell.getValue()); console.log(cell.getColumn().getField()); 
        cell.setValue(cell.getValue()+" selected",true);},
      }, 
      {title: 'Friday', field: 'f', align: 'center',
        cellClick: function(e, cell){console.log(cell.getValue()); console.log(cell.getColumn().getField());},
      }, 
      {title: 'Saturday', field: 'sa', align: 'center',
        cellClick: function(e, cell){console.log(cell.getValue()); console.log(cell.getColumn().getField());},
      } ],
    
    tableData: [ 
    {id: 1, su: '08:30', m: '08:00', t: '08:00', w: '08:00', th: '08:00', f: '08:00', sa: '08:00'}, 
    {id: 2, su: '10:20', m: '09:00', t: '09:00', w: '09:00', th: '09:00', f: '09:00', sa: '09:00'}, 
    {id: 3, su: '10:00', m: '10:00', t: '10:00', w: '10:00', th: '10:00', f: '10:00', sa: '10:00'}, 
    {id: 4, su: '11:00', m: '11:00', t: '11:00', w: '11:00', th: '11:00', f: '11:00', sa: '11:00'}, 
    {id: 5, su: '12:00', m: '12:00', t: '12:00', w: '12:00', th: '12:00', f: '12:00', sa: '12:00'}, 
    {id: 6, su: '13:00', m: '13:00', t: '13:00', w: '13:00', th: '13:00', f: '13:00', sa: '13:00'}, 
    {id: 7, su: '14:00', m: '14:00', t: '14:00', w: '14:00', th: '14:00', f: '14:00', sa: '14:00'}, 
    {id: 8, su: '15:00', m: '15:00', t: '15:00', w: '15:00', th: '15:00', f: '15:00', sa: '15:00'}, 
    {id: 9, su: '16:00', m: '16:00', t: '16:00', w: '16:00', th: '16:00', f: '16:00', sa: '16:00'}, 
    {id: 10, su: '17:00', m: '17:00', t: '17:00', w: '17:00', th: '17:00', f: '17:00', sa: '17:00'}, 
    {id: 11, su: '18:00', m: '18:00', t: '18:00', w: '18:00', th: '18:00', f: '18:00', sa: '18:00'}, ],
	  addData: {id: null, su: null, m: null, t: null, w: null, th: null, f: null, sa: null},
	  };
    
	},
  mounted() {
    this.tabulator = new Tabulator('#table', {
	  data: this.tableData,
	  columns: this.tableColumn,
    responsiveLayout:"hide", // hide rows that no longer fit
	  //layout: 'fitColumns',
    layout: 'fitDataFill',
    history: true,
    resizableRows:true,
    resizableColumns:true,
    selectable:3,
  
    rowClick:function(e, row){
    //e - the click event object
    //row - row component
      row.toggleSelect();
    },
    rowDeselected:function(row){
    //row - row component for the deselected row
    console.log(row.getData());
    },
    
    /*
    rowSelectionChanged:function(data, rows){
        //update selected row counter on selection change
    	//$("#select-stats span").text(data.length);
    },
    */
    

    //movableRowsSender: "incrementMoved",
    movableRows: true,
    movableRowsConnectedTables: '#select',
    movableRowsReceiver: 'add',
    
    //movableRowsSender: 'delete',
    rowMoved:function(row){
        //row - row component
    },
    //need add a function in Selected.vue to "undo"
    placeholder: 'All Times Selected',
    footerElement:"<button>Custom Button</button>",
    history:true,
    rowFormatter:function(row){
        var data = row.getData(); //get data object for row

        if(data.col == "blue"){
            row.getElement().css({"background-color":"#A6A6DF"}); //apply css change to row element
        }
    },
	  });
	},
  
  methods: {
    //var row1 = 
    /*
    dataLoaded:function(data){ //freeze first row on data load
		var firstRow = this.getRows()[0];

		if(firstRow){
			firstRow.freeze();
		}
	  },
    */ 
    /*
    //select row on "select" button click
    $("#select-row").click(function(){
        table.selectRow(1);
    });

    //deselect row on "deselect" button click
    $("#deselect-row").click(function(){
        table.deselectRow(1);
    });

    //select row on "select all" button click
    $("#select-all").click(function(){
        table.selectRow();
    });

    //deselect row on "deselect all" button click
    $("#deselect-all").click(function(){
        table.deselectRow();
    });
    */
    rowMoved:function(row){
        console.log("Row: " + row.getData().name + " has been moved");
    },
    addTabulator() {
	  const obj = Object.assign({}, this.addData);
	  obj.id = this.tableData.length;
	  this.tableData.push(obj);
	  Object.keys(this.addData).forEach((key => {
	    this.addData[key] = null;
      }));
    },
  },
  watch: {
    tableData: {
      handler: function(newData) {
        this.tabulator.replaceData(newData);
      },
      deep: true,
    },
  },
};
//select row on "select" button click
    $("#select-row").click(function(){
        table.selectRow(1);
    });

    //deselect row on "deselect" button click
    $("#deselect-row").click(function(){
        table.deselectRow(1);
    });

    //select row on "select all" button click
    $("#select-all").click(function(){
        table.selectRow();
    });

    //deselect row on "deselect all" button click
    $("#deselect-all").click(function(){
        table.deselectRow();
    });


</script>

<style>
@import '~tabulator-tables/dist/css/tabulator.min.css'
</style>