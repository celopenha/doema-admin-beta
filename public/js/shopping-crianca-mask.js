// <!-- Mascaras do formulário - [ start ]-->


$(document).ready(function () {
    var options =  {
        onKeyPress: function(tel, options) {
            var masks = ['(00) 00000-0000', '(00) 0000-0000'];
            var mask = (tel.slice(5).indexOf("9")==0) ? masks[0] : masks[1];
            $('#celular').mask(mask, options);
        }
    };
    $('#celular').mask('(00) 00000-0000', options);
    $('#cep').mask('00000-000');    
    $('#cpf').mask('000.000.000-00');    
    $('.cpf').mask('000.000.000-00');
    $('#endereco_celular').mask('(00) 00000-0000');
    $('#contato2').mask('(00) 00000-0000');
    $('#endereco_fone').mask('(00) 0000-0000');
    $('#fone').mask('(00) 0000-0000');
    $('#contato1').mask('(00) 0000-0000');
    $('#cnpj').mask('00.000.000/0000-00');
    $('.cnpj').mask('00.000.000/0000-00');
    $('#horaInicio').mask('00/00/0000 00:00');
    $('#horaFim').mask('00/00/0000 00:00');
    $('#dia').mask('00/00/0000 00:00');     
});


// <!-- Mascaras do formulário - [ end ]-->