angular.module("JPStorageModule", []).service("JPStorage", ["$injector", function ($injector) {
		
		this.prepararBaseStorage = function (service, arr_init, sufixo) {
			prepararBaseStorageJS( getNomeBD(service, sufixo), arr_init);
		}

		this.atualizarObjetoStorage = function (service, form, sufixo) {
			atualizarObjetoStorageJS( getNomeBD(service, sufixo), form);
			return criarRetornoThen(form, []);
		}

		this.removerObjetoStorage = function (service, id, sufixo) {
			removerObjetoStorageJS( getNomeBD(service, sufixo), id);

			//ao remover, ja retorna a lista atualizada
			var lista = buscarTodosStorageJS( getNomeBD(service, sufixo));
			return criarRetornoThen({}, lista);
		}

		this.buscarObjetoPorIdStorage = function (service, id, sufixo) {
			var obj = buscarObjetoPorIdStorageJS( getNomeBD(service, sufixo), id);
			if(obj && obj!=null){
				return criarRetornoThen(obj, []);
			}else{
				return criarRetornoThenErro(500, "Nenhum dado nao encontrado com o ID "+id);
			}
		}

		this.listarPorFiltrosStorage = function (service, chaveValor, sufixo) {
			var lista = listarPorFiltrosStorageJS( getNomeBD(service, sufixo), chaveValor);
			return criarRetornoThen({}, lista);
		}

		this.buscarTodosComLimiteStorage = function (service, limite, ordenacao, sufixo) {
			var lista = buscarTodosComLimiteStorageJS( getNomeBD(service, sufixo), limite, ordenacao);
			return criarRetornoThen({}, lista);
		}

		this.buscarTodosStorage = function (service, sufixo, ordenacao) {
			var lista = buscarTodosStorageJS( getNomeBD(service, sufixo), ordenacao);
			return criarRetornoThen({}, lista);
		}

		function getNomeBD(service, sufixo){
			nomeBD = service.nome + (sufixo && sufixo!=null ? sufixo : "");
			return nomeBD;
		}

	}
]);
