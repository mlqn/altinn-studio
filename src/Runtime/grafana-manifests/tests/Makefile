.PHONY: setup-kind setup-grafana setup-grafana-dashboards clean

KIND_NAME := test

setup-cluster:
	kind create cluster --name $(KIND_NAME) --config=cluster.yaml

	# not necessary
	kubectl config use-context kind-$(KIND_NAME)

	helm upgrade -i grafana-operator oci://ghcr.io/grafana/helm-charts/grafana-operator --version v5.20.0

	# helm repo add external-secrets https://charts.external-secrets.io
	# helm repo update
	# helm install external-secrets external-secrets/external-secrets

	# Ensure CRDs are established before creating CRs
	# kubectl get crds
	# kubectl wait --for=condition=Established crd grafanas.grafana.integreatly.org --timeout=120s
	# kubectl wait --for=condition=Established crd grafanadashboards.grafana.integreatly.org --timeout=120s
	# kubectl wait --for=condition=Established crd grafanaalertrulegroups.grafana.integreatly.org --timeout=120s
	# kubectl wait --for=condition=Established crd grafanacontactpoints.grafana.integreatly.org --timeout=120s

	kubectl create namespace grafana
	kubectl apply -f grafana.yaml

	# kubectl config use-context kind-$(KIND_NAME)

setup-infra:
	# Wait for Grafana Operator to be ready
	# kubectl wait --for=condition=GrafanaReady grafana/grafana --timeout=5m

	# kubectl create namespace runtime-gateway

	# kubectl apply -k infra/tt02
	# kubectl create secret generic external-grafana-altinn-studio-gateway-url --from-literal=url="http://localhost:5062/api/v1/alerts?org=ttd&env=tt02" -n grafana
	kubectl create secret generic external-grafana-altinn-studio-gateway-token --from-literal=token="token" -n grafana
	kubectl create secret generic external-grafana-altinn-slack-webhook --from-literal=url="http://localhost" -n grafana

setup-manifests:
	# Wait for Grafana Operator to be ready
	# kubectl wait --for=condition=GrafanaReady grafana/grafana --timeout=5m
	kubectl apply -k .

clean:
	kind delete cluster --name $(KIND_NAME)
