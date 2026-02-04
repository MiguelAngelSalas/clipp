-- CreateEnum
CREATE TYPE "turnos_estado" AS ENUM ('pendiente', 'confirmado', 'finalizado', 'cancelado');

-- CreateTable
CREATE TABLE "clientes" (
    "id_cliente" SERIAL NOT NULL,
    "id_comercio" INTEGER NOT NULL,
    "nombre_cliente" VARCHAR(100) NOT NULL,
    "whatsapp" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100),
    "fecha_creacion" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "comercios" (
    "id_comercio" SERIAL NOT NULL,
    "nombre_empresa" VARCHAR(100) NOT NULL,
    "direccion" VARCHAR(255),
    "telefono_unico" VARCHAR(50),
    "email_unico" VARCHAR(100) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "suscrito" BOOLEAN NOT NULL DEFAULT false,
    "hora_apertura" TEXT NOT NULL DEFAULT '09:00',
    "hora_cierre" TEXT NOT NULL DEFAULT '20:00',
    "duracion_turno_min" INTEGER NOT NULL DEFAULT 30,
    "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" VARCHAR(255),
    "resetToken" VARCHAR(255),
    "resetTokenExpiry" TIMESTAMP(0),
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comercios_pkey" PRIMARY KEY ("id_comercio")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id_turno" SERIAL NOT NULL,
    "id_comercio" INTEGER NOT NULL,
    "id_cliente" INTEGER,
    "nombre_invitado" VARCHAR(100),
    "contacto_invitado" VARCHAR(50),
    "servicio" VARCHAR(100) NOT NULL,
    "fecha" DATE NOT NULL,
    "hora" TIME(0) NOT NULL,
    "estado" "turnos_estado" DEFAULT 'pendiente',
    "monto" DECIMAL(10,2) DEFAULT 0.00,
    "metodo_pago" VARCHAR(50),
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id_turno")
);

-- CreateTable
CREATE TABLE "movimientos_caja" (
    "id_movimiento" SERIAL NOT NULL,
    "id_comercio" INTEGER NOT NULL,
    "fecha" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DECIMAL(10,2) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "metodo_pago" VARCHAR(50) NOT NULL,
    "tipo" VARCHAR(20) NOT NULL DEFAULT 'INGRESO',

    CONSTRAINT "movimientos_caja_pkey" PRIMARY KEY ("id_movimiento")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_cliente_por_comercio" ON "clientes"("id_comercio", "whatsapp");

-- CreateIndex
CREATE UNIQUE INDEX "email_unico" ON "comercios"("email_unico");

-- CreateIndex
CREATE UNIQUE INDEX "comercios_slug_key" ON "comercios"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "comercios_verificationToken_key" ON "comercios"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "comercios_resetToken_key" ON "comercios"("resetToken");

-- CreateIndex
CREATE INDEX "id_cliente" ON "turnos"("id_cliente");

-- CreateIndex
CREATE INDEX "id_comercio" ON "turnos"("id_comercio");

-- CreateIndex
CREATE UNIQUE INDEX "turnos_id_comercio_fecha_hora_key" ON "turnos"("id_comercio", "fecha", "hora");

-- CreateIndex
CREATE INDEX "id_comercio_caja" ON "movimientos_caja"("id_comercio");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_ibfk_1" FOREIGN KEY ("id_comercio") REFERENCES "comercios"("id_comercio") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_ibfk_1" FOREIGN KEY ("id_comercio") REFERENCES "comercios"("id_comercio") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_ibfk_2" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movimientos_caja" ADD CONSTRAINT "caja_ibfk_1" FOREIGN KEY ("id_comercio") REFERENCES "comercios"("id_comercio") ON DELETE CASCADE ON UPDATE NO ACTION;
