<!DOCTYPE html>
<html>

<head>
    <style>
        .title {
            font-weight: bold;
        }

        .image {
            width: 300px;
            margin-bottom: 10px;
        }

        .align-right {
            text-align: right;
        }

        .mt {
            margin-top: 5px;
            display: block;
        }

        .mt-15 {
            margin-top: 50px;
            display: block;
        }

        @media only screen and (min-width: 520px) {
            .u-row {
                width: 500px !important;
            }

            .u-row .u-col {
                vertical-align: top;
            }

            .u-row .u-col-50 {
                width: 250px !important;
            }

            .u-row .u-col-100 {
                width: 500px !important;
            }
        }

        @media (max-width: 520px) {
            .u-row-container {
                max-width: 100% !important;
                padding-left: 0px !important;
                padding-right: 0px !important;
            }

            .u-row .u-col {
                min-width: 320px !important;
                max-width: 100% !important;
                display: block !important;
            }

            .u-row {
                width: 100% !important;
            }

            .u-col {
                width: 100% !important;
            }

            .u-col>div {
                margin: 0 auto;
            }
        }

        body {
            margin: 0;
            padding: 0;
        }

        table,
        tr,
        td {
            vertical-align: top;
            border-collapse: collapse;
        }

        p {
            margin: 0;
        }

        .ie-container table,
        .mso-container table {
            table-layout: fixed;
        }

        * {
            line-height: inherit;
        }

        a[x-apple-data-detectors='true'] {
            color: inherit !important;
            text-decoration: none !important;
        }

        table,
        td {
            color: #000000;
        }
    </style>
</head>

<body>


    <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="font-family:arial,helvetica,sans-serif; margin-top:25px;">
        <tr>
            <td style="padding-right: 0px;padding-left: 0px;" align="center">

                <img align="center" border="0" src="https://assets.unlayer.com/projects/183801/1695678773683-logo.png"
                    alt="" title=""
                    style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 28%;max-width: 135.8px;"
                    width="145px" />

            </td>
        </tr>

    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="font-family:arial,helvetica,sans-serif; margin-top:25px;">
        <tr>
            <td style="padding-right: 0px;padding-left: 0px;" align="center">

                <h3>VISITA GENERADA</h3>

            </td>
        </tr>
    </table>

    <table width="100%" style="font-family:arial,helvetica,sans-serif; margin-top:25px;">
        <tr>
            <td valign="top">
                <h3>Información del Visitante</h3>

                @if (count($user) > 0 || $user != null)
                    <div class="mt">
                        <b>Nombre:</b> {{ $user['name'] }}
                    </div>
                @endif
                <div class="mt">
                    <b>Cédula:</b> {{ $visit->visitor_id }}
                </div>
                <div class="mt">
                    <b>Fecha:</b> {{ $visit->visit_date }}
                </div>
                <div class="mt">
                    <b>Hora:</b> {{ $visit->visit_time }}
                </div>
                <div class="mt">
                    <b>Cantidad de Personas:</b> {{ $visit->number_visitors }}
                </div>
                <div class="mt">
                    <b>Tipo de Visita:</b> {{ $visit->type_visit }}
                </div>
                <div class="mt">
                    @if ($visit->description != null)
                        <b>Nota:</b> {{ $visit->description }}
                    @else
                        <b>Nota:</b> S/N
                    @endif
                </div>

                <h3 class="mt-15">Información del Vehículo</h3>

                <div class="mt">
                    <b>Placa:</b> {{ $visit['vehicle_plate'] }}
                </div>
                @if (count($vehicle) > 0 || $vehicle != null)
                    <div class="mt">
                        <b>Marca:</b> {{ $vehicle['brand'] }}
                    </div>
                    <div class="mt">
                        <b>Modelo:</b> {{ $vehicle['model'] }}
                    </div>
                    <div class="mt">
                        <b>Año:</b> {{ $vehicle['model_year'] }}
                    </div>
                @endif

                <h3 class="mt-15">Información del Propietario</h3>
                <div class="mt">
                    <b>Propietario:</b> {{ $visit->house->owner_name . ' ' . $visit->house->owner_surname }}
                </div>
                <div class="mt">
                    <b>Número de Casa:</b> {{ $visit->house->number_house }}
                </div>
                <div class="mt">
                    <b>Teléfono:</b> {{ $visit->house->owner_phone }}
                </div>
                <div class="mt">
                    <b>Email:</b> {{ $visit->house->owner_email }}
                </div>
            </td>
            @if (count($imgs) > 0 || $imgs != null)
                <td class="align-right" valign="top">
                    <h3>Imágenes</h3>
                    <img class="image" src="{{ $imgs[0] }}" alt="Imagen 1"> <br>
                    <img class="image" src="{{ $imgs[1] }}" alt="Imagen 2"> <br>
                    <img class="image" src="{{ $imgs[2] }}" alt="Imagen 3"> <br>
                    <img class="image" src="{{ $imgs[3] }}" alt="Imagen 4">
                </td>
            @endif
        </tr>
    </table>

    <table style="font-family:arial,helvetica,sans-serif;margin-top:25px;" role="presentation" cellpadding="0"
        cellspacing="0" width="100%" border="0">
        <tbody>
            <tr>
                <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;"
                    align="left">

                    <div style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
                        <p style="line-height: 140%;">
                            <strong>Bitaldata 2023 ©
                                - SJBDevSoft 2023 ©</strong>
                        </p>
                    </div>

                </td>
            </tr>
        </tbody>
    </table>
</body>

</html>
