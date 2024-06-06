<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        @page { margin:0px; }
    </style>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin-bottom: 50px;
            height: 100%;
        }
        .logo {
            width: 135px;
            height: auto;
            float: left;
            margin-top: 20px;
            margin-left: 20px;
        }
        .header-content {
            display: inline-block;
            float: right;
            background-color: #38bdf8;
            color: white;
            padding: 10px 25px 10px 20px;
            text-align: right;
            margin-top: 15px;
            border-bottom-left-radius: 15px;
            border-top-left-radius: 15px;
        }
        .header-content h1 {
            margin: 0;
        }
        .content-table {
            margin-top: 150px;
        }
        .information,
        .images {
            float: left; /* Floats both elements to the left initially */
            width: 50%; /* Each occupies 50% of the width */
            box-sizing: border-box; /* Ensures padding doesn't affect width */
        }
        .images {
            float: right; /* Moves the "images" section to the right */
        }
        .item-left {
            display: inline-block;
            background-color: #38bdf8;
            color: white;
            float: left;
            font-size: 18px;
            font-weight: bold;
            padding: 5px 10px;
            border-bottom-right-radius: 15px;
            border-top-right-radius: 15px;

        }
        .item-right {
            display: inline-block;
            background-color: #38bdf8;
            color: white;
            float: right;
            font-size: 18px;
            font-weight: bold;
            padding: 5px 10px;
            border-bottom-left-radius: 15px;
            border-top-left-radius: 15px;
        }
        .table-data {
            padding: 20px 0px;
            margin-top: 40px;
            width: 100%;
        }
        .table-data th {
            text-align: left;
            font-size: 14px;
            background-color: #38bdf8;
            color: white;
            padding: 4px 4px;
            border-top-right-radius: 15px;
            border-bottom-right-radius: 15px;

        }
        .table-data td {
            font-size: 14px;
            padding: 4px 4px;
            border-bottom: 1px solid #38bdf8;

        }
        .img-container {

            width: 85%;
            background-color: #38bdf8;
            border-bottom-left-radius: 15px;
            border-top-left-radius: 15px;
            padding: 8px;
            float: right;
        }
        .container {
            min-height: 100vh;
            padding-bottom: 20px;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <img
            src="https://assets.unlayer.com/projects/183801/1695678773683-logo.png"
            alt="Logo"
            class="logo"
        />
        <div class="header-content">
            <h1 style="font-size: 22px; font-weight: bold; color: white;">Bitácora Digital</h1>
            <h1 style="font-size: 18px; font-weight: bold; color: white; margin-bottom: 5px;">
                {{ $payload['company_name'] }}
            </h1>
            <h1 style="font-size: 17px; font-weight: normal; color: white;">
                {{ $payload['complex_name'] }}
            </h1>

        </div>
    </div>

    <div class="content-table">
        <div class="information">
            <h1
                class="item-left"

            >
                Información del Visitante
            </h1>

            <table class="table-data">
                <tr>
                    <th>Cédula:</th>
                    <td>1752931350</td>
                </tr>
                @if($payload['person'])
                    <tr>
                        <th>Nombre:</th>
                        <td>
                            {{ $payload['person']['name'] }}
                        </td>
                    </tr>
                @endif

                <tr>
                    <th>Fecha de Visita:</th>
                    <td>{{ $payload['visitor']['visit_date'] }}</td>
                </tr>
                <tr>
                    <th>Hora de Visita:</th>
                    <td>{{ $payload['visitor']['visit_time'] }}</td>
                </tr>
                <tr>
                    <th>Cantidad de Personas:</th>
                    <td>{{ $payload['visitor']['number_visitors'] }} Personas</td>
                </tr>
                <tr>
                    <th>Tipo de Visita:</th>
                    <td>{{ $payload['visitor']['type_visit'] }}</td>
                </tr>
                <tr>
                    <th>Observaciones:</th>
                    <td>
                        {{ str_replace(['<p>', '</p>'], '', $payload['visitor']['description']) }}
                    </td>
                </tr>
            </table>

            <h1
                class="item-left"
            >
                Información del Vehículo
            </h1>
            <table class="table-data">
                <tr>
                    <th>Placa:</th>
                    <td>
                        {{ strtoupper($payload['vehicle']['plate']) }}
                    </td>
                </tr>

                @if($payload['vehicle'])
                    <tr>
                        <th>Tipo:</th>
                        <td>
                            {{ $payload['vehicle']['class'] }}
                        </td>
                    </tr>
                    <tr>
                        <th>Modelo:</th>
                        <td>{{ $payload['vehicle']['model'] }}</td>
                    </tr>
                    <tr>
                        <th>Marca:</th>
                        <td>
                            {{ $payload['vehicle']['brand'] }}
                        </td>
                    </tr>
                    <tr>
                        <th>Servicio:</th>
                        <td>
                            {{ $payload['vehicle']['service'] }}
                        </td>
                    </tr>
                    <tr>
                        <th>Año:</th>
                        <td>
                            {{ $payload['vehicle']['model_year'] }}
                        </td>
                    </tr>
                @endif
            </table>

            <h1 class="item-left">
                Información del Propietario
            </h1>
            <table class="table-data">
                <tr>
                    <th>
                        Propietario:
                    </th>
                    <td>
                        {{ $payload['owner']['owner_name'] }}
                    </td>
                </tr>
                <tr>
                    <th>
                        Casa N#:
                    </th>
                    <td>
                        {{ $payload['owner']['number_house'] }}
                    </td>
                </tr>
                <tr>
                    <th>Teléfono:</th>
                    <td>
                        {{ $payload['owner']['owner_phone'] }}
                    </td>
                </tr>
                <tr>
                    <th>Email:</th>
                    <td>
                        {{ $payload['owner']['owner_email'] }}
                    </td>
                </tr>
            </table>
        </div>
        <div class="images">
            <h1 class="item-right">
                Imágenes de la Bitácora
            </h1>
            <div class="table-data">
                @for($i = 0; $i < $payload['camera_number']; $i++)
                    <img
                        src="{{ $payload['images'][$i] }}"
                        alt="Imagen 2"
                        class="img-container"
                        style="margin-top: {{ $i * 188 }}px;"
                    />
                @endfor
            </div>
        </div>
    </div>
</div>
</body>
</html>
