import { Link } from 'react-router-dom';
import { CheckCircle, BookOpen, ArrowRight } from 'lucide-react';

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Congratulations! You have successfully enrolled in the course.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <p className="text-green-800 font-medium mb-2">
              Your enrollment has been confirmed
            </p>
            <p className="text-green-700 text-sm">
              You can now access all course materials and start learning immediately.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/dashboard"
              className="flex items-center justify-center space-x-2 w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              <BookOpen className="w-5 h-5" />
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/"
              className="block w-full border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors font-medium"
            >
              Browse More Courses
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              A confirmation email has been sent to your registered email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
