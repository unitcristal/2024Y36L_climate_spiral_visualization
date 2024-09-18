## ccsv, climate change spiral visualization

FROM python:3.9

WORKDIR /workspace

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ssl /root/.jupyter/ssl

EXPOSE 8888

COPY . .

CMD ["jupyter", "lab", \
    "--allow-root", \
    "--ip=0.0.0.0", \
    "--port=8888", \
    "--no-browser", \
    "--NotebookApp.token=''", \
    "--certfile=/root/.jupyter/ssl/cert.pem", \
    "--keyfile=/root/.jupyter/ssl/key.pem"]