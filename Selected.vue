<template>
	<div id='select'></div>
</template>

<!-- selected the stop(and the time) we want to get to??? estimate where to take the shuttle????
 what if one person wants to take the shuttle from another stop???-->
 <!--cellclick ->change function to edit or delete the cell???-->
<script>
const Tabulator = require('tabulator-tables');
export default {
  data() {
    return {
      tabulator: null,
      tableColumn: [
      {title: 'Sunday', field: 'su', align: 'center', cellClick: function(e, cell){console.log(cell.getValue()); console.log(cell.getColumn().getField())},}, 
      {title: 'M', field: 'm', align: 'center', cellClick: function(e, cell){console.log(cell.getValue()); console.log(cell.getColumn().getField())},}, 
      {title: 'Tuesday', field: 't', align: 'center', cellClick: function(e, cell){console.log(cell.getValue()); console.log(cell.getColumn().getField())},}, 
      {title: 'Wednesday', field: 'w', align: 'center', cellClick: function(e, cell){console.log(cell.getValue()); console.log(cell.getColumn().getField())},}, 
      {title: 'Thursday', field: 'th', align: 'center', cellClick: function(e, cell){console.log(cell.getValue()); console.log(cell.getColumn().getField())},}, 
      {title: 'Friday', field: 'f', align: 'center', cellClick: function(e, cell){console.log(cell.getValue()); console.log(cell.getColumn().getField())},}, 
      {title: 'Saturday', field: 'sa', align: 'center', cellClick: function(e, cell){console.log(cell.getValue()); console.log(cell.getColumn().getField())},} 
      ],
    };
  },

  mounted() {
    this.tabulator = new Tabulator('#select', {
      data: [],
      columns: this.tableColumn,
      height: 250,
      layout: 'fitColumns',
      placeholder: 'Drag Times',
      movableRows: true,
      movableRowsConnectedTables: '#select',
      //movableRowsReceiver: 'add',
      movableRowsSender: 'delete',
      placeholder: 'No Times Selected',
      
    });
  },
  methods: {
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
</script>

<style>
@import '~tabulator-tables/dist/css/tabulator.min.css'
</style>
