// Call the dataTables jQuery plugin
$(document).ready(function() {
  $('#dataTable').DataTable({
      "language": {
            "lengthMenu": "Visualizar _MENU_ registros por página",
            "zeroRecords": "Nada encontrado - desculpe",
            "info": "Visualizando página _PAGE_ de _PAGES_",
            "infoEmpty": "Nenhum registro disponível",
            "infoFiltered": "(filtrado de _MAX_ registros totais)",
            "search": "Pesquisar",
            "next" : "Próxima",
            "dataTable_previous": "Anterior",
            "oPaginate": {
                "sNext": "Próximo",
                "sPrevious": "Anterior",
                "sFirst": "Primeiro",
                "sLast": "Último"
            },
        }
  });
});
