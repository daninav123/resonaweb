import { Request, Response, NextFunction } from 'express';
import { contractService } from '../services/contract.service';
import { AppError } from '../middleware/error.middleware';

interface AuthRequest extends Request {
  user?: any;
}

export class ContractController {
  /**
   * Generar contrato PDF
   */
  async generateContract(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;

      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      // Generar PDF
      const pdfBuffer = await contractService.generateContract(orderId);

      // Enviar PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=contrato-${orderId}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}

export const contractController = new ContractController();
