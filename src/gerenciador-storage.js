function prepararBaseStorageJS(nomeBD, arr_init){
	var ls = window.localStorage[nomeBD];
	if(!ls || ls==null){
		console.log("--> Iniciando BD "+nomeBD);
		window.localStorage[nomeBD] = JSON.stringify(arr_init);
	}
}

function limparTodasBasesStorageJS(){
	console.log("--> Deletando todos os BDs");
	window.localStorage.clear();
}

function limparBaseStorageJS(nomeBD){
	console.log("--> Removendo BD "+nomeBD);
	window.localStorage.removeItem(nomeBD);
}

function atualizarObjetoStorageJS(nomeBD, form){
	console.log("--> Atualizando BD "+nomeBD);

	var bd = buscarTodosStorageJS(nomeBD);

	if(!form.id || form.id == null){
		//cadastro
		form.id = bd.length+1;
		bd.push(form);
	}else{
		//alteracao
		var arr = retornarIndiceArrayEObjetoStorageJS(nomeBD, form.id);
		bd[ arr[0] ] = form;
	}
	
	window.localStorage[nomeBD] = JSON.stringify(bd);
}

function buscarObjetoPorIdStorageJS(nomeBD, id){
	var arr = retornarIndiceArrayEObjetoStorageJS(nomeBD, id);
	if(!arr || arr == null){
		return null;
	}
	return arr[1];
}

function removerObjetoStorageJS(nomeBD, id){
	console.log("--> Removendo no BD "+nomeBD);
	var arr = retornarIndiceArrayEObjetoStorageJS(nomeBD, id);
	var bd = buscarTodosStorageJS(nomeBD);
	bd.splice(arr[0], 1);
	
	window.localStorage[nomeBD] = JSON.stringify(bd);
}

/**
Busca objetos no storage pelo nome 'do banco' e um objeto contendo o campo de pesquisa e os valores.
O valor deve ser um array com 2 posicoes, sendo a primeira posicao o valor em si e a segunda o tipo de consulta 'like' ou 'equals'.
Exemplo:

 listarPorFiltrosStorageJS('nomebanco', {'nome':[valor,'LIKE'], 'documento':[valor,'EQUALS']});

**/
function listarPorFiltrosStorageJS(nomeBD, chaveValor){
	console.log("--> listarPorFiltrosStorage '"+nomeBD+"', chaveValor '"+JSON.stringify(chaveValor)+"'");
	var bd = buscarTodosStorageJS(nomeBD);
	var arrayResultado = [];

	if(bd){
		if(!chaveValor || chaveValor==null){
			arrayResultado = bd;
		}else{

			for(var idx = 0; idx <= bd.length; idx++){
				var obj = bd[idx];
				if(obj){

					for(var campo in chaveValor){
						if(campo && campo!=null && arrayResultado.indexOf(obj)<0){
							var arrayValor = chaveValor[campo];
							var valor = arrayValor[0];
							var tipoBusca = arrayValor[1];

							var valorAtributo = invokeInternalValue(obj, campo, valor, tipoBusca);
							if(valorAtributo && valorAtributo!=null){
								if($.isArray(valorAtributo)){
									arrayResultado.push.apply(arrayResultado, valorAtributo);
								}else{
									arrayResultado.push(obj);
								}
							}
						}
					}
				}
			}
		}
	}
	return arrayResultado;
}

function invokeInternalValue(objeto, campo, valor, tipoBusca){
	campo = campo.trim();
	var campos = campo.indexOf(".") > -1 ? [campo.substring(0, campo.indexOf(".")),campo.substring(campo.indexOf(".")+1)] : [campo,null];
	var campoAtual = campos[0];
	var campoInterno = campos[1];

	if($.isArray(objeto)){
		//tipo array, tenta buscar em todos os dados dentro.
		var retorno = [];
		for(var idx = 0; idx < objeto.length; idx++){
			var objValor = objeto[idx];
			var v = invokeInternalValue(objValor, campo, valor, tipoBusca);
			if(v && v!=null){
				retorno.push(objValor);
			}
		}
		return retorno;
	}else{
		var objValor = objeto[campoAtual];
		if(objValor && objValor!=null){

			if (typeof objValor == 'string' || typeof objValor == 'number') {
				objValor = (""+objValor).toLowerCase();

				if( (tipoBusca.toLowerCase() == 'like') && objValor.indexOf(valor.toLowerCase())>=0){
					return objeto;

				}else if( (tipoBusca.toLowerCase() == 'equals') && objValor == valor.toLowerCase()){
					return objeto;

				}else{
					return null;
				}
			}else if(campoInterno && campoInterno!=null){
				//tipo objeto, busca os dados internamente.
				return invokeInternalValue(objValor, campoInterno, valor, tipoBusca);
			}
		}
	}
}

function buscarTodosComLimiteStorageJS(nomeBD, limite, ordenacao){
	var listaObjetos = buscarTodosStorageJS(nomeBD, ordenacao);
	if(listaObjetos && listaObjetos!=null){
		limite = listaObjetos.length < limite ? listaObjetos.length : limite;
		listaObjetos = listaObjetos.splice(0,limite);
	}
	return listaObjetos;
}

function buscarTodosStorageJS(nomeBD, ordenacao){
	var bd = window.localStorage[nomeBD];
	if(!bd || bd == null){
		return null;
	}
	var listaObjetos = JSON.parse(bd);
	if(ordenacao && ordenacao!=null){
		listaObjetos = listaObjetos.sort(function(a,b) {
			if(a == null || b == null){
				return 0;
			}
		    return a[ordenacao] < b[ordenacao] ? -1 : a[ordenacao] > b[ordenacao] ? 1 : 0;
		});
	}
	return listaObjetos;
}

function retornarIndiceArrayEObjetoStorageJS(nomeBD, id){
	var arr = buscarTodosStorageJS(nomeBD);
	if(!arr || arr == null){
		return [0,{}];
	}
	
	for(idx = 0; idx <= arr.length; idx++){
		var obj = arr[idx];
		if(obj && obj != null){
			if(obj.id == id){
				return [idx,obj];
			}
		}
	}
	return [0,{}];
}

//funcao que cria um retorno de objeto com atributo 'then', para simular o retorno do promisse.
//esta funcao recebe 2 parametros, para compor o retorno do resultado ao metodo 'then':
//1. Um objeto JSON unico representando o formulario da tela ou um objeto JSON buscado por ID no Java (depende do contexto). Caso nao tenha retorno, pode ser {}.
//2. Um array representando buscas de dados no Java. Caso nao tenha retorno, pode ser [].
function criarRetornoThen(form, lista){
	var retorno = {
		then: function(funcaoOK, funcaoErro){
			var resultServer = {
				"dado":form,
				"lista":lista,
				"status":200,
				"mensagens":[
					{"chave":"mensagem","valor":"Operação realizada com sucesso."}
				]
			}
			if(typeof funcaoOK == "function"){
				funcaoOK(resultServer);
			}
			return resultServer;
		}
	}
	return retorno;
}

function criarRetornoThenErro(status, mensagem){
	var retorno = {
		then: function(funcaoOK, funcaoErro){
			var resultServer = {
				data: {
					"dado":{},
					"lista":[],
					"status":status,
					"mensagens":[
						{"chave":"mensagem","valor": mensagem}
					]
				}
			}
			funcaoErro(resultServer);
		}
	}
	return retorno;
}